import React from 'react';
import { CanvasTextInstance } from '@/workspaces/designWorkspace/types';
import { useChangeInstanceObjectProperty } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/useChangeInstanceProperty';
import { EditableNumberInput } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/EditableNumberInput';
import SliderDemo from '@/workspaces/designWorkspace/components/ui/SliderDemo';
import FontFamilySelect
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/Typography/FontFamilySelect';
import { availableFonts } from '@/workspaces/designWorkspace/lib/availableFonts';
import { EditableTextInput } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/EditableTextInput';

interface Props {
  instance: CanvasTextInstance
}

const TypographyProperty: React.FC<Props> = ({ instance }) => {
  const { changeObjectProperty } = useChangeInstanceObjectProperty();
  const getPercantageFromKoef = (koef: number | undefined) => Math.round((koef ?? 1) * 100);
  const lineHeight = getPercantageFromKoef(instance.object?.lineHeight)
  const letterSpacing = getPercantageFromKoef(instance.object?.letterSpacing)
  const handleLetterSpacingChange = (value: number[]) => {
    const newSpacing = value[0] / 100;
    changeObjectProperty(instance.id,'letterSpacing', newSpacing);
  };
  const handleLineHeightChange = (value: number[]) => {
    const newSpacing = value[0] / 100;
    changeObjectProperty(instance.id,'lineHeight', newSpacing);
  };
  return (
    <div className="w-full flex flex-col gap-3">
      <SliderDemo title={'letter spacing'} min={-300} max={500} value={[letterSpacing]} onChange={handleLetterSpacingChange} />
      <SliderDemo title={'line height'} max={300} value={[lineHeight]} onChange={handleLineHeightChange} />
      <EditableTextInput title={'text value'} text={instance.object.text?? ""} onChangeAction={(text)=> changeObjectProperty(instance.id, 'text', text)}/>
      <EditableNumberInput text={instance.object.fontSize?.toString() ?? "0"} valueDimension={'px'} title={'font size'} onChangeAction={(size)=> changeObjectProperty(instance.id, 'fontSize', Number(size))}/>
      <FontFamilySelect
        fonts={availableFonts}
        value={instance.object.fontFamily}
        onChange={(font) => changeObjectProperty(instance.id, 'fontFamily', font)}
      />
    </div>
  );
};

export default TypographyProperty;
