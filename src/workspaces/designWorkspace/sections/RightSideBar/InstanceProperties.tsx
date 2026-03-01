'use client';
import React, { useEffect, useState } from 'react';
import { Accordion } from '../../components/ui/accordion';
import AccordionPropItem from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/AccordionPropItem';
import PositionProperty
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/PositionProperty';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import FillStrokeProperty
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/FillStrokeProperty';
import AppearanceProperty
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/Appearance/AppearanceProperty';
import TypographyProperty
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/Typography/TypographyProperty';
import { EditableTextInput } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/EditableTextInput';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import ExportProperty
  from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/InstancePropertiesSections/Export/ExportProperty';

type Props = {
  instance: CanvasInstance | null
}
const InstanceProperties: React.FC<Props> = () => {
  const [instance, setInstance] = useState<CanvasInstance | null>(null);
  const { updateInstance, getInstanceById , layers} = useCanvasLayersStore();
  const { selectedInstancesIds } = useSelectedInstances();
  useEffect(() => {
    if (selectedInstancesIds.length > 1) {
      setInstance(null);
    } else {
      setInstance(getInstanceById(selectedInstancesIds[0]));
    }
  }, [selectedInstancesIds, setInstance, getInstanceById, layers]);
  return (
    <div className={'py-4'}>
      {instance !== null && <EditableTextInput text={instance.name}
                                               onChangeAction={(newText) => updateInstance(instance.id, (instance) => ({
                                                 ...instance,
                                                 name: newText,
                                               }))} className={'px-3'} />}
      <Accordion type="single" collapsible className="w-full">
        {instance !== null &&
          <>
            <AccordionPropItem header={'Position'} ContentComponent={<PositionProperty instance={instance} />} />
            <AccordionPropItem header={'Fill & Stroke'}
                               ContentComponent={<FillStrokeProperty instance={instance} />} />
            <AccordionPropItem header={'Appearence'} ContentComponent={<AppearanceProperty instance={instance} />} />
            {instance.type === 'text' &&
              <AccordionPropItem header={'Typography'}
                                 ContentComponent={<TypographyProperty instance={instance} />} />}
          </>
        }
        <AccordionPropItem header={'Export'} ContentComponent={<ExportProperty />} />
      </Accordion>
    </div>
  )
}

export default InstanceProperties;
