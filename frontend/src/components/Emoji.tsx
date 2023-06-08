import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react';
import { HiOutlineEmojiHappy } from 'react-icons/hi';

interface Props {
    setInputMessage: Dispatch<SetStateAction<string>>;
    inputRef: RefObject<HTMLInputElement>;
}

const Emoji = ({ setInputMessage, inputRef }: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        function handleKeydown(event: KeyboardEvent) {
            const key = event.key;

            if (key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeydown);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    const emojiHanlder = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        setIsOpen(true);
    };

    const changeHandler = (emojiData: EmojiClickData) => {
        const curosrPosition = inputRef.current?.selectionStart;
        const emoji = String.fromCodePoint(parseInt(emojiData.unified, 16));

        setInputMessage((prev) => {
            const letters = prev.split('');
            letters.splice(curosrPosition as number, 0, emoji);

            return letters.join('');
        });

        setIsOpen(false);

        inputRef.current?.focus();
    };

    return (
        <>
            <div className="">
                <button
                    type="button"
                    className="btn-ghost btn-sm btn-circle btn"
                    onClick={emojiHanlder}
                >
                    <HiOutlineEmojiHappy className="text-2xl" />
                </button>
            </div>

            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>

                    <div className="absolute bottom-0 right-0 shadow-lg sm:right-24">
                        <EmojiPicker
                            onEmojiClick={changeHandler}
                            width={300}
                            autoFocusSearch={false}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default Emoji;
