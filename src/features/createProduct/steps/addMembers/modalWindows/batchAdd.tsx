'use client';

import { useCreationProductStore } from '@/features/createProduct/store';
import { csvExcelParser } from '@/lib/sheets.JS/CsvExcelParser';
import { ALLOWED_INPUT_FIELDS } from '@/shared/constants/allowedFiles/allowedInputFiles';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { Poppins } from 'next/font/google';
import { useState, useEffect } from 'react';
import { Member } from '../types';
import { notesService } from '@/entities/note/api/notesService';
import { useProductStore } from '@/entities/product/store';

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const Poppins400 = Poppins({
  weight: ['400'],
  subsets: ['latin'],
});

interface ExtractedMember {
  name: string;
  email: string;
  role: string;
  isValid: boolean;
  error?: string;
  matchedUser?: any | null;
}

// Flexible role validation
const validateRole = (role: string): { isValid: boolean; normalizedRole: string; error?: string } => {
  if (!role || typeof role !== 'string') {
    return { isValid: false, normalizedRole: '', error: 'Role is missing' };
  }

  const roleLower = role.trim().toLowerCase();
  
  // Product Manager variations
  if (roleLower === 'pm' || 
      roleLower === 'p' || 
      roleLower === 'product manager' || 
      roleLower === 'productmanager' ||
      roleLower === 'product amager' ||
      (roleLower.includes('product') && roleLower.includes('manager'))) {
    return { isValid: true, normalizedRole: 'Product Manager' };
  }
  
  // Designer
  if (roleLower === 'designer' || roleLower.includes('design')) {
    return { isValid: true, normalizedRole: 'Designer' };
  }
  
  // Engineer/QA
  if (roleLower === 'engineer' || 
      roleLower === 'qa' || 
      roleLower === 'engineer/qa' ||
      roleLower === 'engineer / qa' ||
      roleLower.includes('engineer') || 
      roleLower.includes('qa')) {
    return { isValid: true, normalizedRole: 'Engineer/QA' };
  }
  
  // Founder / CEO / CPO
  if (roleLower === 'founder' || 
      roleLower === 'ceo' || 
      roleLower === 'cpo' ||
      roleLower === 'founder / ceo / cpo' ||
      roleLower.includes('founder') || 
      roleLower.includes('ceo') || 
      roleLower.includes('cpo')) {
    return { isValid: true, normalizedRole: 'Founder / CEO / CPO' };
  }
  
  return { 
    isValid: false, 
    normalizedRole: '', 
    error: `Invalid role: "${role}". Allowed: Product Manager (PM, P), Designer, Engineer/QA, Founder / CEO / CPO` 
  };
};

const BatchAdd = () => {
  const [isShown, setIsShown] = useState<boolean>(false);
  const [nameOfFiles, setNameOfFiles] = useState<string[] | []>([]);
  const [extractedMembers, setExtractedMembers] = useState<ExtractedMember[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { batchAddMembers, members } = useCreationProductStore();
  const { chosenProduct } = useProductStore();

  // Fetch all users for matching
  useEffect(() => {
    if (isShown && chosenProduct?.id) {
      const fetchUsers = async () => {
        try {
          const response = await notesService.searchUsersForMention({
            productId: chosenProduct.id,
            limit: 1000
          });
          if (response.success && response.users) {
            setAllUsers(response.users);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchUsers();
    }
  }, [isShown, chosenProduct?.id]);

  const onAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget?.files?.[0];
    if (!file) return;

    setError('');
    setExtractedMembers([]);
    setIsLoading(true);

    try {
      const parsedData = await csvExcelParser(file);
      
      if (!parsedData || parsedData.length === 0) {
        setError('File is empty or could not be parsed');
        setNameOfFiles([]);
        setIsLoading(false);
        return;
      }

      setNameOfFiles([file.name]);

      // Get column keys from first row
      const firstRow = parsedData[0];
      if (!firstRow) {
        setError('File has no data rows');
        setIsLoading(false);
        return;
      }

      const allKeys = Object.keys(firstRow);
      
      console.log('=== CSV PARSING DEBUG ===');
      console.log('Total rows:', parsedData.length);
      console.log('Column keys:', allKeys);
      console.log('First row data:', firstRow);
      
      // Find columns (case-insensitive)
      let nameKey: string | undefined;
      let emailKey: string | undefined;
      let roleKey: string | undefined;
      
      for (const key of allKeys) {
        const keyLower = key.toLowerCase().trim();
        if ((keyLower === 'name' || keyLower === 'full name' || keyLower === 'fullname') && !nameKey) {
          nameKey = key;
        }
        if ((keyLower === 'email' || keyLower === 'e-mail' || keyLower.includes('email')) && !emailKey) {
          emailKey = key;
        }
        if ((keyLower === 'role' || keyLower === 'position' || keyLower.includes('role') || keyLower.includes('position')) && !roleKey) {
          roleKey = key;
        }
      }
      
      // Fallback to first 3 columns
      if (!nameKey && allKeys.length > 0) nameKey = allKeys[0];
      if (!emailKey && allKeys.length > 1) emailKey = allKeys[1];
      if (!roleKey && allKeys.length > 2) roleKey = allKeys[2];

      console.log('Detected columns - Name:', nameKey, 'Email:', emailKey, 'Role:', roleKey);

      if (!nameKey || !emailKey) {
        setError(`Missing required columns. Found: ${allKeys.join(', ')}. Required: Name, Email, Role`);
        setIsLoading(false);
        return;
      }

      // Extract and validate members
      const extracted: ExtractedMember[] = [];
      const errors: string[] = [];

      parsedData.forEach((row, index) => {
        const name = nameKey ? String(row[nameKey] || '').trim() : '';
        const email = emailKey ? String(row[emailKey] || '').trim() : '';
        const role = roleKey ? String(row[roleKey] || '').trim() : '';

        console.log(`Row ${index + 1}:`, { name, email, role, rawRow: row });

        // Skip empty rows
        if (!name && !email && !role) return;

        // Validate
        if (!name) {
          errors.push(`Row ${index + 2}: Name is missing`);
          extracted.push({ name: 'N/A', email: email || 'N/A', role: role || 'N/A', isValid: false, error: 'Name missing' });
          return;
        }

        if (!email || !email.includes('@')) {
          errors.push(`Row ${index + 2}: Valid email required`);
          extracted.push({ name, email: email || 'N/A', role: role || 'N/A', isValid: false, error: 'Invalid email' });
          return;
        }

        const roleValidation = validateRole(role);
        if (!roleValidation.isValid) {
          extracted.push({ name, email, role: role || 'N/A', isValid: false, error: roleValidation.error });
          return;
        }

        // Match with existing user by email
        const matchedUser = allUsers.find(u => 
          u.email?.toLowerCase() === email.toLowerCase()
        ) || null;

        extracted.push({ 
          name, 
          email, 
          role: roleValidation.normalizedRole, 
          isValid: true,
          matchedUser
        });
      });

      console.log('Total extracted members:', extracted.length);
      console.log('Valid members:', extracted.filter(m => m.isValid).length);
      console.log('All extracted:', extracted);

      setExtractedMembers(extracted);
      
      if (errors.length > 0) {
        setError(`Some rows have errors:\n${errors.join('\n')}`);
      }
      
      if (extracted.length === 0) {
        setError('No data found in file. Please check the file format.');
      }
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message || 'Unknown error'}`);
      setNameOfFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onConfirm = () => {
    const validMembers = extractedMembers.filter(m => m.isValid);
    
    if (validMembers.length === 0) {
      setError('No valid members to add. Please fix the errors in your file.');
      return;
    }

    // Convert to Member format
    const newMembers: Member[] = validMembers.map((member) => {
      // Map role to position
      let position = 'Other';
      if (member.role === 'Product Manager') {
        position = 'PM';
      } else if (member.role === 'Designer') {
        position = 'Designer';
      } else if (member.role === 'Engineer/QA') {
        position = 'Engineer/QA';
      } else if (member.role === 'Founder / CEO / CPO') {
        position = 'PM';
      }

      return {
        name: member.name,
        email: member.email,
        position: position,
        isOwner: false,
      };
    });

    // Filter duplicates
    const existingEmails = new Set(members.map(m => m.email?.toLowerCase()));
    const uniqueNewMembers = newMembers.filter(m => !existingEmails.has(m.email?.toLowerCase() || ''));

    if (uniqueNewMembers.length === 0) {
      setError('All members from the file are already added.');
      return;
    }

    // Add to store
    batchAddMembers(uniqueNewMembers);
    
    // Reset and close
    setNameOfFiles([]);
    setExtractedMembers([]);
    setError('');
    setIsShown(false);
  };

  const onCancel = () => {
    setNameOfFiles([]);
    setExtractedMembers([]);
    setError('');
    setIsShown(false);
  };

  return (
    <div>
      <div
        className="text-[#4E6DB3] hover:underline cursor-pointer text-[13px]"
        onClick={() => setIsShown(true)}
      >
        Batch Add
      </div>

      {isShown && (
        <div className={`fixed inset-0 p-10 text-[12px] text-black bg-[rgba(55,55,55,0.49)] ${Poppins600.className} font-semibold flex justify-center items-center z-50`}>
          <div className="px-10 pb-10 pt-5 mt-25 bg-white rounded-4xl w-[900px] max-h-[85vh] opacity-100 flex flex-col justify-between overflow-hidden">
            <input
              onChange={onAddFile}
              type="file"
              id="business-files"
              className="hidden"
              accept={ALLOWED_INPUT_FIELDS.sheets.flat().join()}
            />
            {(nameOfFiles.length === 0 && (
              <>
                <div className={`font-semibold text-[16px] ${Poppins600.className} mt-4 mb-2`}>
                  <div>
                    Upload .CSV, PDF, or Excel files that include the names, emails, and roles of team members
                  </div>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm whitespace-pre-line">
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="business-files"
                    className="flex items-center justify-center w-[100%] z-10 mx-auto mt-5 border border-[#535354] rounded-[12px] text-center cursor-pointer transition-all duration-300"
                  >
                    <div className="w-1/2 py-10">
                      <div className={`text-center font-semibold text-[16px] ${Poppins600.className}`}>
                        Drag or Upload
                      </div>
                      <div
                        style={{
                          boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60 )',
                        }}
                        className="mt-8 mx-auto w-50 h-10 rounded-[12px] flex items-center justify-center bg-[#EAEDF2] hover:scale-95 transition-all active:scale-90"
                      >
                        Upload
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex justify-end pt-5">
                  <div className="flex items-center justify-around w-1/3">
                    <div
                      className="hover:underline hover:cursor-pointer"
                      onClick={onCancel}
                    >
                      Cancel
                    </div>
                    <div className="w-[135px] opacity-50 cursor-not-allowed">
                      <ConfirmBtn
                        className="w-[135px] h-[45px]"
                        text="Confirm"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </>
            )) || (
              <div className="flex flex-col justify-start h-full overflow-hidden">
                <div className={`text-2xl ${Poppins600.className} mb-4`}>Upload your file</div>
                <div className="border border-[rgba(0,0,0,0.5)] flex flex-col gap-2 overflow-y-auto max-h-20 p-5 mt-5 rounded-[12px]">
                  {nameOfFiles.map((item, index) => (
                    <div className={`text-[16px] ${Poppins400.className}`} key={index}>{item}</div>
                  ))}
                </div>
                <div className={`flex justify-between text-[16px] ${Poppins400.className} mt-3`}>
                  <div>{extractedMembers.filter(m => m.isValid).length} valid member(s) detected</div>
                  <div 
                    className={`text-[#4E6DB3] hover:underline hover:cursor-pointer`}
                    onClick={() => {
                      console.log('Preview members:', extractedMembers);
                      alert(`Preview:\n\n${extractedMembers.map((m, i) => 
                        `${i + 1}. ${m.name} (${m.email}) - ${m.role} ${m.isValid ? '✓' : '✗'} ${m.matchedUser ? '(Found)' : '(Not found)'}`
                      ).join('\n')}`);
                    }}
                  >
                    Preview
                  </div>
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm whitespace-pre-line">
                    {error}
                  </div>
                )}
                {isLoading && (
                  <div className="mt-3 text-center text-gray-500">Processing file...</div>
                )}
                {extractedMembers.length > 0 && (
                  <div className="flex-1 overflow-auto border border-[rgba(0,0,0,0.3)] rounded-[12px] p-4 mt-4 mb-4">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className={`pb-2 ${Poppins600.className} text-xs`}>Name</th>
                          <th className={`pb-2 ${Poppins600.className} text-xs`}>Email</th>
                          <th className={`pb-2 ${Poppins600.className} text-xs`}>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedMembers.map((member, index) => (
                          <tr key={index} className={`border-b border-gray-200 ${!member.isValid ? 'bg-red-50' : ''}`}>
                            <td className={`py-2 ${Poppins400.className} text-xs`}>{member.name}</td>
                            <td className={`py-2 ${Poppins400.className} text-xs`}>{member.email}</td>
                            <td className={`py-2 ${Poppins400.className} text-xs`}>
                              {member.isValid ? (
                                <span className="text-green-600">{member.role}</span>
                              ) : (
                                <span className="text-red-600 text-xs">{member.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <label htmlFor="business-files">
                  <div
                    style={{
                      boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60 )',
                    }}
                    className="mt-4 w-50 h-10 rounded-[12px] cursor-pointer flex items-center justify-center bg-[#EAEDF2] hover:scale-95 transition-all active:scale-90"
                  >
                    Upload
                  </div>
                </label>
                <div className="flex justify-end mt-auto pt-5 text-[12px]">
                  <div className="flex items-center justify-around w-1/3">
                    <div
                      className="hover:underline hover:cursor-pointer"
                      onClick={onCancel}
                    >
                      Cancel
                    </div>
                    <div className="w-[135px]" onClick={onConfirm}>
                      <ConfirmBtn className="w-[135px] h-[45px]" text="Confirm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchAdd;

