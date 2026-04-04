import svgPaths from "./svg-an7px2iw0i";
import imgImageOmatekLogo from "./c7e79ece1297a97b1452c8e3fcffd0dba9b46413.png";

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[327.008px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[48px] left-0 text-[32px] text-black top-[-0.5px] whitespace-nowrap">Document Intelligence</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[327.008px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] left-0 text-[15px] text-black top-[-1px] whitespace-nowrap">Upload and Analyze Documents, flag issues</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[78.5px] relative shrink-0 w-[327.008px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Heading />
        <Paragraph />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d="M12 5V19M5 12H19" id="Vector" stroke="var(--stroke-0, #E5E6E7)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="flex-[1_0_0] h-[24px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Bold',sans-serif] font-bold leading-[24px] left-[108.5px] text-[16px] text-center text-white top-[-0.5px] whitespace-nowrap">{`Upload & Analyze Documents`}</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-black h-[53px] relative rounded-[10px] shrink-0 w-[296.766px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[24px] relative size-full">
        <Icon />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex h-[78.5px] items-start justify-between left-[32px] top-[32px] w-[1189px]" data-name="Container">
      <Container1 />
      <Button />
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[35px] relative shrink-0 w-[93.445px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Public_Sans:Medium',sans-serif] font-medium leading-[21px] left-[47px] text-[14px] text-black text-center top-0 whitespace-nowrap">Key Metrics</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[35px] relative shrink-0 w-[158.141px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Public_Sans:Medium',sans-serif] font-medium leading-[21px] left-[79.5px] text-[14px] text-black text-center top-[-1px] whitespace-nowrap">Discrepencies/ Issues</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[35px] relative shrink-0 w-[102.07px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-b-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-[51.5px] text-[14px] text-black text-center top-px whitespace-nowrap">Ingestion Log</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[16px] h-[35px] items-start relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[32px] pb-px top-[142.5px] w-[1189px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e8eef7] border-b border-solid inset-0 pointer-events-none" />
      <Container3 />
    </div>
  );
}

function HeaderCell() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[374.477px]" data-name="Header Cell">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[24px] not-italic text-[#6a7282] text-[12px] top-[13px] tracking-[0.6px] uppercase whitespace-nowrap">Ingestion NAME</p>
    </div>
  );
}

function HeaderCell1() {
  return (
    <div className="absolute h-[40px] left-[374.48px] top-0 w-[137.781px]" data-name="Header Cell">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[9.52px] not-italic text-[#6a7282] text-[12px] top-[12px] tracking-[0.6px] uppercase whitespace-nowrap">Number of Docs</p>
    </div>
  );
}

function HeaderCell2() {
  return (
    <div className="absolute h-[40px] left-[512.26px] top-0 w-[231.938px]" data-name="Header Cell">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[24px] not-italic text-[#6a7282] text-[12px] top-[13px] tracking-[0.6px] uppercase whitespace-nowrap">Upload Date</p>
    </div>
  );
}

function HeaderCell3() {
  return (
    <div className="absolute h-[40px] left-[744.2px] top-0 w-[328.469px]" data-name="Header Cell">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[24px] not-italic text-[#6a7282] text-[12px] top-[13px] tracking-[0.6px] uppercase whitespace-nowrap">Uploaded By</p>
    </div>
  );
}

function HeaderCell4() {
  return <div className="absolute h-[40px] left-[1072.66px] top-0 w-[114.336px]" data-name="Header Cell" />;
}

function TableRow() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[1187px]" data-name="Table Row">
      <HeaderCell />
      <HeaderCell1 />
      <HeaderCell2 />
      <HeaderCell3 />
      <HeaderCell4 />
    </div>
  );
}

function TableHeader() {
  return (
    <div className="absolute bg-[#f9fafb] h-[40px] left-0 top-0 w-[1187px]" data-name="Table Header">
      <TableRow />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Q1 Financial Report 2026</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0001</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="absolute h-[71.5px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container5 />
      <Container6 />
    </div>
  );
}

function TableCell1() {
  return (
    <div className="absolute h-[71.5px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25px] tracking-[-0.1504px] whitespace-nowrap">PDF</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="absolute h-[71.5px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25px] tracking-[-0.1504px] whitespace-nowrap">03/31/2026</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">Sarah Johnson</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Chief Financial Officer</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="absolute h-[71.5px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[22.5px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function TableCell4() {
  return (
    <div className="absolute h-[71.5px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button4 />
    </div>
  );
}

function TableRow1() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[71.5px] left-0 top-0 w-[1187px]" data-name="Table Row">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Annual Budget Proposal</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0002</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="absolute h-[72px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container9 />
      <Container10 />
    </div>
  );
}

function TableCell6() {
  return (
    <div className="absolute h-[72px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">Excel</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="absolute h-[72px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/28/2026</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">David Thompson</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Budget Director</p>
    </div>
  );
}

function TableCell8() {
  return (
    <div className="absolute h-[72px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon2 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="absolute h-[72px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button5 />
    </div>
  );
}

function TableRow2() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[72px] left-0 top-[71.5px] w-[1187px]" data-name="Table Row">
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
      <TableCell8 />
      <TableCell9 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Expense Report - March</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0003</p>
    </div>
  );
}

function TableCell10() {
  return (
    <div className="absolute h-[72px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container13 />
      <Container14 />
    </div>
  );
}

function TableCell11() {
  return (
    <div className="absolute h-[72px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">PDF</p>
    </div>
  );
}

function TableCell12() {
  return (
    <div className="absolute h-[72px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/25/2026</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">Emily Rodriguez</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Accounting Manager</p>
    </div>
  );
}

function TableCell13() {
  return (
    <div className="absolute h-[72px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container15 />
      <Container16 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon3 />
    </div>
  );
}

function TableCell14() {
  return (
    <div className="absolute h-[72px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button6 />
    </div>
  );
}

function TableRow3() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[72px] left-0 top-[143.5px] w-[1187px]" data-name="Table Row">
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell14 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Tax Compliance Documents</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0004</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="absolute h-[72px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container17 />
      <Container18 />
    </div>
  );
}

function TableCell16() {
  return (
    <div className="absolute h-[72px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">PDF</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="absolute h-[72px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/30/2026</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">Lisa Anderson</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Tax Compliance Specialist</p>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="absolute h-[72px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container19 />
      <Container20 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon4 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="absolute h-[72px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button7 />
    </div>
  );
}

function TableRow4() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[72px] left-0 top-[215.5px] w-[1187px]" data-name="Table Row">
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Revenue Analysis Report</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0005</p>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="absolute h-[72px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container21 />
      <Container22 />
    </div>
  );
}

function TableCell21() {
  return (
    <div className="absolute h-[72px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">Excel</p>
    </div>
  );
}

function TableCell22() {
  return (
    <div className="absolute h-[72px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/27/2026</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">Maria Garcia</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Revenue Analyst</p>
    </div>
  );
}

function TableCell23() {
  return (
    <div className="absolute h-[72px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon5 />
    </div>
  );
}

function TableCell24() {
  return (
    <div className="absolute h-[72px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button8 />
    </div>
  );
}

function TableRow5() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[72px] left-0 top-[287.5px] w-[1187px]" data-name="Table Row">
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell23 />
      <TableCell24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">Cash Flow Statement</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0006</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="absolute h-[72px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container25 />
      <Container26 />
    </div>
  );
}

function TableCell26() {
  return (
    <div className="absolute h-[72px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">PDF</p>
    </div>
  );
}

function TableCell27() {
  return (
    <div className="absolute h-[72px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/26/2026</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">James Wilson</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Financial Controller</p>
    </div>
  );
}

function TableCell28() {
  return (
    <div className="absolute h-[72px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon6 />
    </div>
  );
}

function TableCell29() {
  return (
    <div className="absolute h-[72px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button9 />
    </div>
  );
}

function TableRow6() {
  return (
    <div className="absolute border-[#e5e7eb] border-b border-solid h-[72px] left-0 top-[359.5px] w-[1187px]" data-name="Table Row">
      <TableCell25 />
      <TableCell26 />
      <TableCell27 />
      <TableCell28 />
      <TableCell29 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">{`Profit & Loss Summary`}</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[326.477px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">DOC-0007</p>
    </div>
  );
}

function TableCell30() {
  return (
    <div className="absolute h-[71.5px] left-0 top-0 w-[374.477px]" data-name="Table Cell">
      <Container29 />
      <Container30 />
    </div>
  );
}

function TableCell31() {
  return (
    <div className="absolute h-[71.5px] left-[374.48px] top-0 w-[137.781px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">Excel</p>
    </div>
  );
}

function TableCell32() {
  return (
    <div className="absolute h-[71.5px] left-[512.26px] top-0 w-[231.938px]" data-name="Table Cell">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[24px] not-italic text-[#4a5565] text-[14px] top-[25.5px] tracking-[-0.1504px] whitespace-nowrap">03/29/2026</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[21px] left-[24px] top-[16.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#101828] text-[14px] top-0 tracking-[-0.1504px] whitespace-nowrap">Michael Chen</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[37.5px] w-[280.469px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-px whitespace-nowrap">Senior Financial Analyst</p>
    </div>
  );
}

function TableCell33() {
  return (
    <div className="absolute h-[71.5px] left-[744.2px] top-0 w-[328.469px]" data-name="Table Cell">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p27a6edc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute left-[70.34px] size-[20px] top-[23px]" data-name="Button">
      <Icon7 />
    </div>
  );
}

function TableCell34() {
  return (
    <div className="absolute h-[71.5px] left-[1072.66px] top-0 w-[114.336px]" data-name="Table Cell">
      <Button10 />
    </div>
  );
}

function TableRow7() {
  return (
    <div className="absolute h-[71.5px] left-0 top-[431.5px] w-[1187px]" data-name="Table Row">
      <TableCell30 />
      <TableCell31 />
      <TableCell32 />
      <TableCell33 />
      <TableCell34 />
    </div>
  );
}

function TableBody() {
  return (
    <div className="absolute bg-white h-[503px] left-0 top-[40px] w-[1187px]" data-name="Table Body">
      <TableRow1 />
      <TableRow2 />
      <TableRow3 />
      <TableRow4 />
      <TableRow5 />
      <TableRow6 />
      <TableRow7 />
    </div>
  );
}

function Table() {
  return (
    <div className="h-[543px] relative shrink-0 w-full" data-name="Table">
      <TableHeader />
      <TableBody />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[545px] left-[32px] rounded-[10px] top-[211px] w-[1189px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Table />
      </div>
      <div aria-hidden="true" className="absolute border border-[#eaecf0] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function AiAnalysis() {
  return (
    <div className="absolute bg-white h-[813px] left-[187px] overflow-clip top-0 w-[1253px]" data-name="AIAnalysis">
      <Container />
      <Container2 />
      <Container4 />
    </div>
  );
}

function Container36() {
  return <div className="absolute h-[76.5px] left-0 top-0 w-[186.203px]" data-name="Container" />;
}

function ImageOmatekLogo() {
  return (
    <div className="h-[215.289px] relative shrink-0 w-full" data-name="Image (Omatek Logo)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageOmatekLogo} />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex flex-col h-[61px] items-start left-[20px] overflow-clip pl-[-55.961px] pr-[-55.953px] pt-[-79.297px] top-[8px] w-[104px]" data-name="Container">
      <ImageOmatekLogo />
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute border-[#eaecf0] border-b-[0.5px] border-solid h-[77px] left-0 top-0 w-[186.203px]" data-name="Container">
      <Container36 />
      <Container37 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p275d2400} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p21a7e80} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[21px] relative shrink-0 w-[67.492px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Regular',sans-serif] font-normal leading-[21px] left-[34px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Dashboard</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon8 />
          <Paragraph2 />
        </div>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container39 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_8_2760)" id="Icon">
          <path d={svgPaths.p17e613c0} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p3d61d240} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p20534e00} id="Vector_3" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p392fc080} id="Vector_4" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p3fbca400} id="Vector_5" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p1c1c7100} id="Vector_6" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p240a1800} id="Vector_7" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p162c4500} id="Vector_8" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.pc0a4800} id="Vector_9" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
        <defs>
          <clipPath id="clip0_8_2760">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[21px] relative shrink-0 w-[71.734px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[36px] not-italic text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">AI Analysis</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon9 />
          <Paragraph3 />
        </div>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[#e7e7e7] h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container40 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3713e00} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.pd2076c0} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d="M8.33333 7.5H6.66667" id="Vector_3" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d="M13.3333 10.8333H6.66667" id="Vector_4" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d="M13.3333 14.1667H6.66667" id="Vector_5" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[21px] relative shrink-0 w-[49.328px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Regular',sans-serif] font-normal leading-[21px] left-[25px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Reports</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon10 />
          <Paragraph4 />
        </div>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container41 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p117ed280} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p2fdce00} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.pd0b3a00} id="Vector_3" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[21px] relative shrink-0 w-[72.313px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Regular',sans-serif] font-normal leading-[21px] left-[36.5px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Documents</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon11 />
          <Paragraph5 />
        </div>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container42 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.pae3c380} id="Vector_4" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[21px] relative shrink-0 w-[35.328px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Regular',sans-serif] font-normal leading-[21px] left-[18px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Users</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon12 />
          <Paragraph6 />
        </div>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container43 />
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.ped54800} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p3b27f100} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[21px] relative shrink-0 w-[52.617px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Regular',sans-serif] font-normal leading-[21px] left-[26.5px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Settings</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] relative size-full">
          <Icon13 />
          <Paragraph7 />
        </div>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="h-[45px] relative rounded-[10px] shrink-0 w-[170.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
        <Container44 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[306px] items-start left-0 pl-[8px] pt-[16px] top-[77px] w-[186.203px]" data-name="Container">
      <Button11 />
      <Button12 />
      <Button13 />
      <Button14 />
      <Button15 />
      <Button16 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p38966ca0} id="Vector" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d={svgPaths.p14ca9100} id="Vector_2" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
          <path d="M17.5 10H7.5" id="Vector_3" stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.38889" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[21px] relative shrink-0 w-[48.523px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-[24.5px] text-[#344054] text-[14px] text-center top-0 whitespace-nowrap">Log out</p>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[45px] items-center left-[8px] pl-[16px] rounded-[10px] top-[61.8px] w-[171.195px]" data-name="Button">
      <Icon14 />
      <Paragraph8 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[21px] relative shrink-0 w-[15.922px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">JS</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="bg-[#ecf3ec] relative rounded-[16777200px] shrink-0 size-[32px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[8.039px] relative size-full">
        <Paragraph9 />
      </div>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="flex-[83.195_0_0] h-[21px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Figtree:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-black top-0 whitespace-nowrap">User Name</p>
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.888887" />
        </g>
      </svg>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[48px] relative rounded-[10px] shrink-0 w-[163.195px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[8px] relative size-full">
        <Container48 />
        <Paragraph10 />
        <Icon15 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute content-stretch flex flex-col h-[72.797px] items-start left-0 pl-[12px] pt-[13.297px] top-[114.8px] w-[187.195px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-solid border-t-[0.5px] inset-0 pointer-events-none" />
      <Container47 />
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute h-[187.594px] left-0 top-[625.41px] w-[186.203px]" data-name="Container">
      <Button17 />
      <Container46 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute h-[813px] left-0 top-0 w-[187px]" data-name="Container">
      <Container35 />
      <Container38 />
      <Container45 />
    </div>
  );
}

function Container49() {
  return <div className="absolute border-[#eaecf0] border-r-[0.5px] border-solid h-[813px] left-0 top-0 w-[187px]" data-name="Container" />;
}

function Container33() {
  return (
    <div className="absolute bg-[#f9fafb] h-[813px] left-0 top-0 w-[187px]" data-name="Container">
      <Container34 />
      <Container49 />
    </div>
  );
}

export default function DocumentIntelligencePrototype() {
  return (
    <div className="bg-white relative size-full" data-name="Document Intelligence Prototype">
      <AiAnalysis />
      <Container33 />
    </div>
  );
}