export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#d0c5af] bg-[#181c1b] text-[#e0e3e1]">
      <div className="container-page py-8 text-xs font-sans tracking-wide text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-serif text-lg font-bold text-[#ffffff]">
          Quiz<span className="text-[#D4AF37]">Forge</span>
          <span className="text-xs font-sans font-normal text-[#d0c5af] block sm:inline sm:ml-3">
            Digital Traditionalism & Academic Excellence
          </span>
        </div>
        <div className="text-[#d0c5af] font-medium">
          © 2026 QuizForge. Learn, practise, improve.
        </div>
      </div>
    </footer>
  );
}
