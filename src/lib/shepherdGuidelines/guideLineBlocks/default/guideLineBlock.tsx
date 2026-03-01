import ConfirmBtn from "@/shared/ui/confirmBtn"
import { useGuidelineStore } from "@/store/guidelinesStore"
import { Inter, Open_Sans, Poppins } from "next/font/google"
import Image from "next/image"

export interface GuideLineBlockInterface {
  styles: string
  text:string
  buttonText:string
  title:string
  amount?:number
}


const Inter600 = Inter({
  weight:'600',
  subsets:["cyrillic"]
})

const Poppins600 = Poppins({
  weight:['600'],
  subsets:['latin']
})

const OpenSans400 = Open_Sans({
  weight:['400'],
  subsets:['cyrillic']
})

export default function GuideLineBlock ({styles,amount,title,text,buttonText}:GuideLineBlockInterface) {

  const {incrementStep,setIsGuidelining,setStepOne,step,setTutorialCompleted} = useGuidelineStore()



  const handleClickNext = () => {
    if(step === amount){
      setStepOne()
      setIsGuidelining(false)
      setTutorialCompleted(true) // Mark tutorial as completed when user finishes it
    } else {
      incrementStep()
    }
  }

  const handleExit = () => {
    setStepOne()
    setIsGuidelining(false)
    setTutorialCompleted(true) // Mark tutorial as completed when user skips it
  }


  if(amount){
    return(
      <div className={`absolute w-[360px] max-h-[540px] radius-[10px] ${styles}`}>
        {step === 1 && 
        <div className="breathe absolute z-1000000 size-6 bg-[#0171F8] rounded-full top-[-12px] left-[-8px]">
          <div className="z-1000000 size-12 bg-[#0171F8] opacity-15 rounded-full absolute left-[-11px] top-[-12px]"></div>
        </div>}
        <div className="rounded-[10px] overflow-hidden">
        <div className="h-[184px] w-full relative">
        <Image 
          src="/tour-image/media.svg" 
          alt="" 
          fill 
          style={{ objectFit: 'cover' }} 
        />
      </div>
          <div className="bg-white  pt-[20px] max-h-[204px] p-[20px]">
          <div>
            <h3 className={Poppins600.className}>{title}</h3>
            <p className={`mt-[20px] text-[14px] text-[#32363E] ${OpenSans400.className}`}>{text}</p>
          </div>
          <div className={`mt-[20px] flex justify-between items-center ${Inter600.className}`}>
            <p className={`text-[14px] `}>{step}/5</p>
            <div className="max-h-[45px] max-w-[63px]" onClick={handleClickNext}>
              <ConfirmBtn text={buttonText} className={'px-5 py-5 max-h-[45px] text-[14px]'}/>
            </div>
          </div>
          </div>
        </div>
        <p onClick={handleExit} className={`mt-2 ${Inter600.className} text-white cursor-pointer hover:underline  text-center text-[14px]`}>Skip the tutorial</p>
      </div>
    )
  }
}