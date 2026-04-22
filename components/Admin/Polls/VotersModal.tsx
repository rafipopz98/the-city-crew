const VotersModal = ({ open, onClose, option }: any) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-[#06182e]">{option?.text} voters</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="max-h-100 overflow-y-auto flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[#06182e]/10 rounded-md p-3 text-sm"
            >
              <div className="font-semibold text-[#06182e]">Rafi</div>
              <div className="text-[#06182e]/50 text-xs">rafi@email.com</div>
              <div className="text-[#06182e]/40 text-[10px] mt-1">
                voted 2 mins ago
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotersModal;
