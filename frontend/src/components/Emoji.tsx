import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emojiChangeHandler = (emojiData: any) => {
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

                    <div className="absolute bottom-0 -right-10 md:right-10 shadow-lg">
                        <Picker data={data} onEmojiSelect={emojiChangeHandler} perLine={7} />
                    </div>
                </>
            )}
        </>
    );
};

export default Emoji;
