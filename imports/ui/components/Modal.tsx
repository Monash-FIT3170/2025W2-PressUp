type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ open, onClose, children }: ModalProps) => {
  return (
    <div
      className={`
      fixed inset-0 flex justify-center items-center
      transition-colors z-1000
      ${open ? "visible bg-black/20" : "invisible"}
      `}
    >
      <div
        className={`bg-stone-100 dark:bg-neutral-800 rounded-2xl shadow p-6 transition-all duration-300
    ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
      >
        <button
          onClick={onClose}
          type="button"
          className="cursor-pointer absolute top-2 right-2 p-1 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-stone-600 dark:hover:text-white"
          data-modal-hide="authentication-modal"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
        {children}
      </div>
    </div>
  );
};
