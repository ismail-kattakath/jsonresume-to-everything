import { MdPictureAsPdf } from "react-icons/md";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      aria-label="Print"
      className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-pulse hover:animate-none cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      <MdPictureAsPdf className="text-lg group-hover:scale-110 transition-transform" />
      <span>Print</span>
    </button>
  );
}
