interface FieldData {
  nameOfField: string;
  valueOfField: string;
}

interface VehicleInfoProps {
  data: FieldData[];
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ data }) => {
  const formatFieldData = (data: FieldData[]) => {
    const fieldMap: { [key: string]: { label: string; value: string } } = {};
    
    data.forEach(field => {
      switch (field.nameOfField) {
        case 'name':
          fieldMap['FLEET'] = { label: 'FLEET', value: field.valueOfField };
          break;
        case 'owner':
          fieldMap['OWNER'] = { label: 'OWNER', value: field.valueOfField };
          break;
        case 'dateCreated':
          const createdDate = new Date(field.valueOfField);
          fieldMap['DATE CREATED'] = { 
            label: 'DATE CREATED', 
            value: createdDate.toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            })
          };
          break;
        case 'estimatedCompletion':
          const completionDate = new Date(field.valueOfField);
          fieldMap['ESTIMATED COMPLETION'] = { 
            label: 'ESTIMATED COMPLETION', 
            value: completionDate.toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            })
          };
          break;
        case 'Description':
          fieldMap['DESCRIPTION'] = { label: 'DESCRIPTION', value: field.valueOfField };
          break;
      }
    });


    return [
      fieldMap['FLEET'],
      fieldMap['OWNER'],
      fieldMap['DATE CREATED'],
      fieldMap['ESTIMATED COMPLETION'],
      fieldMap['DESCRIPTION']
    ].filter(Boolean);
  };

  const formattedData = formatFieldData(data);

  return (
    <div className="border-[#9FA8B5] h-full rounded-2xl px-10 py-5 font-open-sans text-[#535354] border min-h-1/2 min-w-[360px]">
      <h2 className="text-[#535354] font-poppins text-2xl font-semibold leading-[140%]">
        Vehicle title
      </h2>
      <div className="mt-10">
        {formattedData.map((field, index) => (
          <div
            className="flex justify-between text-[12px] mt-4 border-b-[1px] border-b-[#C1CCDA]"
            key={index}
          >
            <div className="w-1/2 text-[#535354] font-open-sans text-xs font-normal leading-normal uppercase">{field.label}:</div>
            <div className="w-1/2 break-words font-open-sans text-sm font-normal leading-normal">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleInfo;
