function Text() {
  return (
    <div className="absolute bg-[#e8f0fe] h-[26px] left-[12px] rounded-[26843500px] top-[14px] w-[101px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[8px] not-italic text-[#1a56db] text-[12px] top-[3.8px] whitespace-nowrap">Needs Review</p>
    </div>
  );
}

export default function TableCell() {
  return (
    <div className="bg-white border-[#eaecf0] border-b-[0.8px] border-solid relative size-full" data-name="Table Cell">
      <Text />
    </div>
  );
}