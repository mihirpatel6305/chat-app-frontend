import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ChatImageSkeleton() {
  return (
    <div className="max-w-[200px] max-h-[300px] rounded-lg overflow-hidden shadow-inner">
      <Skeleton
        width={200}
        height={300}
        borderRadius={12}
        baseColor="#e0e0e0"
        highlightColor="#f5f5f5"
        duration={1.5}
      />
    </div>
  );
}

export default ChatImageSkeleton;
