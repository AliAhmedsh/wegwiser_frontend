'use client';
import { useCreationProductStore } from '@/features/createProduct/store';
import { ALLOWED_INPUT_FIELDS } from '@/shared/constants/allowedFiles/allowedInputFiles';

export default function AddMaterialForm() {
  const { materialFiles, addMaterialFile } = useCreationProductStore();

  const onAddMaterialFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file && materialFiles.length <= 30) {
      addMaterialFile(file);
    }
  };

  return (
    <div className="text-[14px] h-full relative">
      <div className="flex justify-between mt-5">
        <div className="text-[13px]">
          Relevant business, strategy, design, and engineering docs
        </div>
        <div className="text-[13px]">{materialFiles.length}/30</div>
      </div>
      
      <label
        htmlFor="business-files"
        className="w-[100%] h-[80%] flex items-center justify-center z-10 mx-auto mt-2 border border-[rgba(0,0,0,0.4)] rounded-[12px] text-center cursor-pointer transition-all duration-300"
      >
        <div className="w-full h-full flex flex-col justify-center">
          <div className="text-center font-poppins font-semibold mt-10 text-[16px]">
            Drag or Upload
          </div>
          <div className="text-[13px] py-2">(JPG, PDF, docx...)</div>
          <input
            type="file"
            id="business-files"
            className="opacity-0 cursor-pointer"
            onChange={onAddMaterialFile}
            accept={Object.values(ALLOWED_INPUT_FIELDS).flat().join(',')}
          />
          <div
            style={{
              boxShadow:
                '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60 )',
            }}
            className="mx-auto w-50 h-10 rounded-[12px] flex items-center justify-center bg-[#EAEDF2] hover:scale-95 transition-all active:scale-90"
          >
            Upload
          </div>
          
          {materialFiles.length > 0 && (
            <div className="mt-4 px-4">
              <div className="text-[11px] font-semibold text-gray-600 mb-2">Uploaded:</div>
              {materialFiles.map((file, index) => (
                <div key={index} className="text-[10px] text-gray-500 mb-1 truncate" title={file.name}>
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
