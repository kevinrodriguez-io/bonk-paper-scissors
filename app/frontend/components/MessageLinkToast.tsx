type MessageLinkToastProps = {
  title: string;
  url: string;
  urlText: string;
};

export const MessageLinkToast = ({
  title,
  url,
  urlText,
}: MessageLinkToastProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div>{title}</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-200 underline"
      >
        {urlText}
      </a>
    </div>
  );
};
