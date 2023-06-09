import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { Fragment, useEffect, useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { useParams } from 'react-router-dom';

import { Message, User } from '../types';
import defaultAvatar from '/default.jpg';

const SearchInChat = () => {
    const { chatId } = useParams();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [filteredMembers, setFilteredMembers] = useState<User[]>();
    const [filteredMessages, setFilteredMessages] = useState<Message[]>();

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    useEffect(() => {
        if (query) {
            const messagesData = queryClient.getQueryData<InfiniteData<Message[]>>([
                'messages',
                chatId,
            ]);
            const membersData = queryClient.getQueryData<User[]>(['members', chatId]);

            if (membersData && messagesData) {
                const members = membersData.filter((member) => {
                    return member.username.includes(query);
                });

                const messages = messagesData.pages.map((page) => {
                    return page.filter((message) => message.text!.includes(query));
                });

                setFilteredMembers(members);
                setFilteredMessages(messages.flat().reverse());
            }
        }
    }, [query, queryClient, chatId]);

    const Compo = ({ highlight, value }: { highlight: string; value: string }) => {
        return <p>{getHighlightedText(value, highlight)}</p>;
    };

    function getHighlightedText(text: string, highlight: string) {
        // Split text on highlight term, include term itself into parts, ignore case
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) => (
            <Fragment key={index}>
                {part.toLowerCase() === highlight.toLowerCase() ? (
                    <b className="bg-base-300">{part}</b>
                ) : (
                    part
                )}
            </Fragment>
        ));
    }

    return (
        <div className="relative max-w-xs text-right">
            <input
                className="input-bordered input input-xs focus:w-64"
                type="text"
                placeholder="Search"
                onChange={changeHandler}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            <HiOutlineSearch className="text-base-content absolute right-2 top-1.5" />
            {query && isFocused && (
                <div className="absolute mt-3 h-[500px] w-full">
                    <ul className="menu rounded-box menu-compact bg-base-100 relative h-full w-[320px] flex-nowrap overflow-y-scroll border p-2 text-left">
                        <li className="menu-title">
                            <span>Member</span>
                        </li>
                        {filteredMembers?.map((member) => {
                            return (
                                <li key={member.id} className="w-full">
                                    <span className="w-full">
                                        <div className="avatar">
                                            <div className="border-base-content w-7 rounded-full">
                                                <img
                                                    src={member.avatar_url || defaultAvatar}
                                                    width={20}
                                                    height={20}
                                                    alt="avatar"
                                                />
                                            </div>
                                        </div>
                                        <Compo value={member.username} highlight={query} />
                                    </span>
                                </li>
                            );
                        })}
                        <li className="menu-title">
                            <span>Message</span>
                        </li>
                        {filteredMessages?.map((message) => {
                            return (
                                <li key={message.id} className="w-full">
                                    <span className="w-full">
                                        <span className="w-full break-words">
                                            <Compo
                                                value={message.text as string}
                                                highlight={query}
                                            />
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchInChat;
