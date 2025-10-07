import download from "../assets/download.svg";

function ShowImageModal({ showImage, onClose }) {
  const handleDownload = async (e) => {
    e.stopPropagation();

    const response = await fetch(showImage.image, { mode: "cors" });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg";
    link.click();

    URL.revokeObjectURL(url); // clean up memory
  };
  if (!showImage?.isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      <div className="relative">
        <img
          src={showImage.image}
          alt="Full view"
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={handleDownload}
          className="absolute top-3 right-14 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition"
          title="download"
        >
          <img src={download} alt="download" className="w-6 h-6" />
        </button>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black bg-white pb-1 px-2 rounded-full text-3xl hover:text-gray-700"
          title="close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default ShowImageModal;
