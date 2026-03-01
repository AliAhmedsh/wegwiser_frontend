import React from 'react';


export const formatAiResponse = (text: string): string => {
  if (!text) return '';

  let formatted = text;


  formatted = formatted.replace(/\n\n/g, '</p><p>');


  formatted = formatted.replace(/\n/g, '<br>');


  formatted = formatted.replace(/^\*   \*\*(.*?)\*\*: (.*?)$/gm, '<li><strong>$1:</strong> $2</li>');
  formatted = formatted.replace(/^\*   (.*?)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^-   \*\*(.*?)\*\*: (.*?)$/gm, '<li><strong>$1:</strong> $2</li>');
  formatted = formatted.replace(/^-   (.*?)$/gm, '<li>$1</li>');


  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');


  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');


  formatted = formatted.replace(/(<li>.*<\/li>)(<br><li>.*<\/li>)*/g, (match) => {
    return `<ul>${match.replace(/<br>/g, '')}</ul>`;
  });


  formatted = `<p>${formatted}</p>`;


  formatted = formatted.replace(/<p><\/p>/g, '');
  formatted = formatted.replace(/<p><br><\/p>/g, '');

  return formatted;
};

export const formatAiResponseToJSX = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside ml-4 mb-3 space-y-1">
          {currentList.map((item, index) => (
            <li key={index} className="text-sm">
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;
    
    // Split by markdown patterns: **bold** and *italic*
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const matches: Array<{ type: 'bold' | 'italic'; start: number; end: number; content: string }> = [];
    
    // Find all bold matches
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
    }
    
    // Find italic matches (simple pattern, avoiding conflicts with bold)
    const italicRegex = /(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g;
    italicRegex.lastIndex = 0;
    while ((match = italicRegex.exec(text)) !== null) {
      // Check if this italic is inside a bold match
      const isInsideBold = matches.some(m => 
        m.type === 'bold' && match!.index >= m.start && match!.index < m.end
      );
      if (!isInsideBold) {
        matches.push({
          type: 'italic',
          start: match.index,
          end: match.index + match[0].length,
          content: match[1]
        });
      }
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Build parts array
    matches.forEach((m, idx) => {
      // Add text before this match
      if (m.start > lastIndex) {
        parts.push(text.substring(lastIndex, m.start));
      }
      
      // Add the formatted match
      if (m.type === 'bold') {
        parts.push(<strong key={`bold-${idx}`}>{m.content}</strong>);
      } else {
        parts.push(<em key={`italic-${idx}`}>{m.content}</em>);
      }
      
      lastIndex = m.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
      }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      flushList();
      elements.push(<br key={`br-${index}`} />);
    } else if (trimmedLine.startsWith('## ')) {
      // H2 heading
      flushList();
      elements.push(
        <h2 key={`h2-${index}`} className="text-lg font-bold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">
          {formatInlineMarkdown(trimmedLine.substring(3))}
        </h2>
      );
    } else if (trimmedLine.startsWith('### ')) {
      // H3 heading
      flushList();
      const headingText = trimmedLine.substring(4);
      // Check if it's a score or special heading
      const isScoreHeading = headingText.includes('Score') || headingText.includes('Scores');
      const isIssuesHeading = headingText.includes('Issues');
      const isNextStepsHeading = headingText.includes('Next Steps') || headingText.includes('Steps');
      const isOverallScore = headingText.includes('Overall Score');
      
      elements.push(
        <h3 key={`h3-${index}`} className={`text-base font-semibold mt-5 mb-3 first:mt-0 pb-2 border-b ${
          isOverallScore ? 'text-gray-900 border-gray-300' :
          isScoreHeading ? 'text-blue-700 border-blue-200' : 
          isIssuesHeading ? 'text-orange-700 border-orange-200' : 
          isNextStepsHeading ? 'text-green-700 border-green-200' : 
          'text-gray-900 border-gray-300'
        }`}>
          {formatInlineMarkdown(headingText)}
        </h3>
      );
    } else if (trimmedLine.startsWith('#### ')) {
      // H4 heading
      flushList();
      const headingText = trimmedLine.substring(5);
      const hasSeverity = headingText.includes('Severity');
      
      elements.push(
        <h4 key={`h4-${index}`} className={`text-sm font-semibold mt-4 mb-2 ${
          hasSeverity ? 'text-orange-800 bg-orange-50 px-3 py-1.5 rounded-md inline-block' :
          'text-gray-800'
        }`}>
          {formatInlineMarkdown(headingText)}
        </h4>
      );
    } else if (trimmedLine.startsWith('*   **') && trimmedLine.includes(':**')) {
      // List item with bold label
      flushList();
      const match = trimmedLine.match(/^\*   \*\*(.*?)\*\*: (.*)$/);
      if (match) {
        currentList.push(`**${match[1]}:** ${match[2]}`);
      }
    } else if (trimmedLine.startsWith('*   **') && !trimmedLine.includes(':**')) {
      // List item with just bold text
      flushList();
      const match = trimmedLine.match(/^\*   \*\*(.*)$/);
      if (match) {
        currentList.push(`**${match[1]}`);
      }
    } else if (trimmedLine.startsWith('*   ')) {
      // Regular list item
      flushList();
      currentList.push(trimmedLine.substring(4));
    } else {
      // Regular paragraph or heading
      flushList();
      // Check if it's a heading (starts with ** and ends with **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        const headingText = trimmedLine.slice(2, -2);
        elements.push(
          <h3 key={`h3-${index}`} className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
            {headingText}
          </h3>
        );
      } else {
        // Check for special line types for better styling
        const isScoreLine = trimmedLine.includes('%') && trimmedLine.includes('Score');
        const isSuggestionLine = trimmedLine.includes('Suggestion:');
        const isSeverityLine = trimmedLine.includes('Severity');
        const isNextStepLine = /^\d+\./.test(trimmedLine);
        
      elements.push(
          <p key={`p-${index}`} className={`mb-2 text-sm leading-relaxed ${
            isScoreLine ? 'text-gray-700 font-medium' :
            isSuggestionLine ? 'text-blue-700 bg-blue-50 p-2 rounded-lg border-l-4 border-blue-400 mt-2' :
            isSeverityLine ? 'text-orange-700 font-semibold' :
            isNextStepLine ? 'text-gray-700 ml-4' :
            'text-gray-800'
          }`}>
          {formatInlineMarkdown(trimmedLine)}
        </p>
      );
      }
    }
  });

  flushList();
  return <div>{elements}</div>;
};
