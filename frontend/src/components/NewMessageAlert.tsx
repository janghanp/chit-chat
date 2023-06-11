import { format } from 'date-fns';

import { Message } from '../types';
import defaultImageUrl from '/default.jpg';

interface Props {
    newMessageClickHandler: () => void;
    message: Message;
}

const NewMessageAlert = ({ newMessageClickHandler, message }: Props) => {
    return (
        <div
            className="absolute bottom-0 left-0 right-0 z-50 bg-base-200 shadow-md cursor-pointer hover:bg-base-300 transition duration-300 border"
            onClick={newMessageClickHandler}
        >
            <div className="flex items-center px-3 py-1 gap-x-5 overflow-x-auto">
                <div className="avatar">
                    <div className="w-7 rounded-full border">
                        <img src={message.sender.avatar_url || defaultImageUrl} alt={'avatart'} />
                    </div>
                </div>
                <div>
                    <div className="text-sm font-semibold">
                        {message.sender.username}
                        <time className="ml-2 text-xs opacity-50">
                            {format(new Date(message.createdAt), 'PP p')}
                        </time>
                    </div>
                    <div className="text-sm">{message.text}</div>
                </div>
            </div>
        </div>
    );
};

export default NewMessageAlert;
