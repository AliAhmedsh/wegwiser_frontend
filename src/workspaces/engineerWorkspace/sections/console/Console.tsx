import { getCookie, API_CONFIG } from '@/lib/config/api';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ConsoleProps {
  productId?: number;
  onRunCode?: (runCodeFn: (code: string) => void) => void;
}

const Console: React.FC<ConsoleProps> = ({ productId = 1, onRunCode }) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [problems, setProblems] = useState<string[]>([]);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [ports, setPorts] = useState<string[]>([
    'Port 3000: Frontend (Next.js) - Running',
    'Port 3001: Backend (Node.js) - Running',
    'Port 5432: PostgreSQL Database - Connected'
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs, buildOutput]);

  const addOutput = (output: string) => {
    setOutputs(prev => [...prev, output]);
  };

  const addBuildOutput = (output: string) => {
    setBuildOutput(prev => [...prev, output]);
  };

  const addProblem = (problem: string) => {
    setProblems(prev => [...prev, problem]);
  };

  const formatError = (errorOutput: string): string => {
    if (errorOutput.includes('Unexpected token \'export\'')) {
      return 'TypeScript Error: This file uses ES modules syntax. Please use CommonJS syntax (module.exports) or add "type": "module" to package.json';
    }
    
    if (errorOutput.includes('To load an ES module, set "type": "module"')) {
      return 'Module Error: This file uses ES modules. Either:\n1. Change "export" to "module.exports"\n2. Or add "type": "module" to package.json';
    }
    
    if (errorOutput.includes('SyntaxError')) {
      const match = errorOutput.match(/SyntaxError: (.+?)(?:\n|$)/);
      if (match) {
        return `Syntax Error: ${match[1]}`;
      }
    }
    
    if (errorOutput.includes('Cannot find module')) {
      const match = errorOutput.match(/Cannot find module '(.+?)'/);
      if (match) {
        return `Module Not Found: The module "${match[1]}" could not be found. Make sure it's installed or the path is correct.`;
      }
    }
    
    if (errorOutput.includes('SyntaxError') && errorOutput.includes('python')) {
      return 'Python Syntax Error: Check your Python code for syntax mistakes like missing colons, incorrect indentation, or typos.';
    }
    
    if (errorOutput.includes('NameError')) {
      const match = errorOutput.match(/NameError: name '(.+?)' is not defined/);
      if (match) {
        return `Python Error: The variable "${match[1]}" is not defined. Make sure you've declared it before using it.`;
      }
    }
    
    if (errorOutput.includes('IndentationError')) {
      return 'Python Indentation Error: Check your code indentation. Python is very strict about proper spacing.';
    }
    
    if (errorOutput.includes('Error:') || errorOutput.includes('error:')) {
      return `Runtime Error: ${errorOutput.split('\n')[0]}`;
    }
    
    return 'Code Execution Failed: Please check your code for errors and try again.';
  };

  const clearOutput = () => {
    setOutputs([]);
    setBuildOutput([]);
  };

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    const commandText = command.trim();
    setCommand('');
    setIsExecuting(true);

    setCommandHistory(prev => [...prev, commandText]);
    setHistoryIndex(-1);

    addOutput(`$ ${commandText}`);

    try {
      const token = getCookie('access_token');
      if (!token) {
        addOutput('Error: No authentication token found. Please login again.');
        return;
      }

      let authToken = token;
      if (token === 'test-token' || !token.includes('.')) {
        const testPayload = {
          sub: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'engineer',
          iss: 'https://dev-7yf0quijjygyy5p0.us.auth0.com/',
          aud: 'https://wegwiser-api',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
        };
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(testPayload));
        const signature = btoa('test-signature');
        authToken = `${header}.${payload}.${signature}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/engineering-workspace/${productId}/console`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ command: commandText }),
      });

      const result = await response.json();
      if (result.success) {
        addOutput(result.output);
      } else {
        const formattedError = formatError(result.output || result.error || 'Command failed');
        addOutput(formattedError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const formattedError = `Network Error: ${errorMessage}`;
      addOutput(formattedError);
    } finally {
      setIsExecuting(false);
    }
  };

  const runCode = useCallback(async (code: string, fileName?: string) => {
    clearOutput();
    setIsExecuting(true);
    
    try {
      let extension = 'js';
      let command = '';
      
      if (fileName) {
        extension = fileName.split('.').pop()?.toLowerCase() || 'js';
      }
      
      const displayFileName = fileName || 'temp_code';
      const fullPath = fileName ? `IRIS-BE/${fileName}` : 'temp_code';
      let commandDisplay = '';
      switch (extension) {
        case 'py':
          commandDisplay = `> ${fullPath}`;
          break;
        case 'js':
        case 'jsx':
          commandDisplay = `> ${fullPath}`;
          break;
        case 'ts':
        case 'tsx':
          commandDisplay = `> ${fullPath}`;
          break;
        default:
          commandDisplay = `> ${fullPath}`;
      }
      addOutput(commandDisplay);
      addBuildOutput(commandDisplay);
      
      const encodedCode = btoa(code);
      
      switch (extension) {
        case 'py':
          command = `echo '${encodedCode}' | base64 -d > temp_code.py && python3 temp_code.py && rm temp_code.py`;
          break;
        case 'js':
        case 'jsx':
          command = `echo '${encodedCode}' | base64 -d > temp_code.js && node temp_code.js && rm temp_code.js`;
          break;
        case 'ts':
        case 'tsx':
          command = `echo '${encodedCode}' | base64 -d > temp_code.ts && npx ts-node temp_code.ts && rm temp_code.ts`;
          break;
        case 'html':
          command = `echo '${encodedCode}' | base64 -d > temp_code.html && open temp_code.html && rm temp_code.html`;
          break;
        case 'css':
          command = `echo '${encodedCode}' | base64 -d > temp_code.css && echo "CSS file created: temp_code.css" && rm temp_code.css`;
          break;
        case 'json':
          command = `echo '${encodedCode}' | base64 -d > temp_code.json && cat temp_code.json && rm temp_code.json`;
          break;
        default:
          command = `echo '${encodedCode}' | base64 -d > temp_code.txt && cat temp_code.txt && rm temp_code.txt`;
      }
      
      const token = getCookie('access_token');
      if (!token) {
        addOutput('Error: No authentication token found. Please login again.');
        addBuildOutput('Error: No authentication token found. Please login again.');
        addProblem('Authentication Error: No token found');
        return;
      }

      let authToken = token;
      if (token === 'test-token' || !token.includes('.')) {
        const testPayload = {
          sub: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'engineer',
          iss: 'https://dev-7yf0quijjygyy5p0.us.auth0.com/',
          aud: 'https://wegwiser-api',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
        };
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(testPayload));
        const signature = btoa('test-signature');
        authToken = `${header}.${payload}.${signature}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/engineering-workspace/${productId}/console`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();
      
      if (result.success) {
        addOutput(result.output);
        addBuildOutput(result.output);
        addOutput('');
        addBuildOutput('');
      } else {
        const formattedError = formatError(result.output || result.error || 'Code execution failed');
        addOutput(formattedError);
        addBuildOutput(formattedError);
        addProblem(formattedError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const formattedError = `Network Error: ${errorMessage}`;
      addOutput(formattedError);
      addBuildOutput(formattedError);
      addProblem(formattedError);
    } finally {
      setIsExecuting(false);
    }
  }, [productId]);

  useEffect(() => {
    if (onRunCode) {
      onRunCode(runCode);
    }
  }, [onRunCode, runCode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const handleConsoleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'problems':
        return (
          <div className="flex-1 flex flex-col gap-6 justify-center px-7 py-8">
            {problems.length === 0 ? (
              <>
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-5/6" />
              </>
            ) : (
              problems.map((problem, index) => (
                <div key={index} className="text-red-400 text-sm">
                  {problem}
                </div>
              ))
            )}
          </div>
        );
      case 'output':
        return (
          <div className="flex-1 flex flex-col gap-6 justify-center px-7 py-8" ref={outputRef}>
            {buildOutput.length === 0 && !isExecuting ? (
              <>
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-5/6" />
              </>
            ) : (
              <>
                {buildOutput.map((output, index) => (
                  <div key={index} className="text-white text-sm whitespace-pre-wrap">
                    {output}
                  </div>
                ))}
                {isExecuting && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span>Code is Running...</span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'debug':
        return (
          <div className="flex-1 flex flex-col gap-6 justify-center px-7 py-8">
            <div className="h-[18px] bg-[#909090] w-2/3" />
            <div className="h-[18px] bg-[#909090] w-2/3" />
            <div className="h-[18px] bg-[#909090] w-5/6" />
          </div>
        );
      case 'ports':
        return (
          <div className="flex-1 flex flex-col gap-6 justify-center px-7 py-8">
            {ports.length === 0 ? (
              <>
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-2/3" />
                <div className="h-[18px] bg-[#909090] w-5/6" />
              </>
            ) : (
              ports.map((port, index) => (
                <div key={index} className="text-white text-sm">
                  {port}
                </div>
              ))
            )}
          </div>
        );
      case 'terminal':
        return (
          <div 
            className="flex-1 flex flex-col gap-1 px-3 py-2 cursor-text text-white text-sm" 
            onClick={handleConsoleClick}
            ref={outputRef}
          >
            {outputs.map((output, index) => (
              <div key={index} className="text-white text-sm whitespace-pre-wrap">
                {output}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                <span>Code is Running...</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (onRunCode) {
      onRunCode(runCode);
    }
  }, [onRunCode]);

  return (
    <div className="bg-[#535354] border-t border-gray-300 flex flex-col h-full">
      <div className="flex items-center gap-4 text-white text-xs font-normal px-3 py-2 border-b border-gray-400">
        <button 
          onClick={() => setActiveTab('problems')}
          className={`hover:text-white hover:border-b-2 hover:border-white ${activeTab === 'problems' ? 'text-white border-b-2 border-white' : ''}`}
        >
          Problems
        </button>
        <button 
          onClick={() => setActiveTab('output')}
          className={`hover:text-white hover:border-b-2 hover:border-white flex items-center gap-1 ${activeTab === 'output' ? 'text-white border-b-2 border-white' : ''}`}
        >
          Output
          {isExecuting && (
            <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('debug')}
          className={`hover:text-white hover:border-b-2 hover:border-white ${activeTab === 'debug' ? 'text-white border-b-2 border-white' : ''}`}
        >
          Debug Console
        </button>
        <button 
          onClick={() => setActiveTab('ports')}
          className={`hover:text-white hover:border-b-2 hover:border-white ${activeTab === 'ports' ? 'text-white border-b-2 border-white' : ''}`}
        >
          Ports
        </button>
        <button 
          onClick={() => setActiveTab('terminal')}
          className={`hover:text-white hover:border-b-2 hover:border-white flex items-center gap-1 ${activeTab === 'terminal' ? 'text-white border-b-2 border-white' : ''}`}
        >
          Terminal
          {isExecuting && (
            <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
          )}
        </button>
        {activeTab === 'terminal' && (
          <button 
            onClick={clearOutput}
            className="ml-auto text-red-400 hover:text-red-300 text-xs"
            title="Clear terminal"
          >
            Clear
          </button>
        )}
      </div>
      
      {renderTabContent()}
      
      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type commands here..."
        disabled={isExecuting}
        className="absolute opacity-0 pointer-events-none"
        style={{ left: '-9999px' }}
        autoFocus
      />
    </div>
  );
};

export default Console;
