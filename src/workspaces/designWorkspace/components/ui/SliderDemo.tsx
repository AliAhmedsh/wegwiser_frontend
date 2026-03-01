import * as React from "react";
import * as Slider from '@radix-ui/react-slider'

interface SliderDemoProps {
  value: number[]
  onChange: (value: number[]) => void
  min?: number,
  max?: number,
  title?: string
}

const SliderDemo: React.FC<SliderDemoProps> = ({ value, onChange,min,max, title }) => {
  return(
  <form className={'px-2'}>
    <p>{title}</p>
    <Slider.Root
      className="relative flex h-5 w-[200px] touch-none select-none items-center"
      value={value}
      onValueChange={onChange}
      max={max ?? 100}
      step={1}
      min={min ?? 0}
    >
      <Slider.Track className="relative h-[3px] bg-black/10 grow rounded-full bg-blackA7">
        <Slider.Range className="absolute h-full rounded-full bg-black" />
      </Slider.Track>
      <Slider.Thumb
        className="block size-3 rounded-[10px] bg-black hover:bg-violet3 focus:shadow-[0_0_0_1px] focus:outline-none transition-all"
        aria-label="Opacity"
      />
    </Slider.Root>
  </form>
)};

export default SliderDemo;
