import { useQueryClient } from '@tanstack/react-query';
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
			const { data } = queryClient.getQueryState(['chat', chatId]);

			const members = data.chat.users.filter((member) => {
				return member.username.includes(query);
			});

			const messages = data.chat.messages.filter((message) => {
				return message.text.includes(query);
			});

			setFilteredMembers(members);
			setFilteredMessages(messages);
		}
	}, [query]);

	const Compo = ({ highlight, value }: { highlight: string; value: string }) => {
		return <p>{getHighlightedText(value, highlight)}</p>;
	};

	function getHighlightedText(text: string, highlight: string) {
		// Split text on highlight term, include term itself into parts, ignore case
		const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		return parts.map((part, index) => (
			<Fragment key={index}>
				{part.toLowerCase() === highlight.toLowerCase() ? <b className="bg-base-300">{part}</b> : part}
			</Fragment>
		));
	}

	return (
		<div className="relative w-full max-w-xs text-right">
			<input
				className="input-bordered input input-xs focus:w-full"
				type="text"
				placeholder="Search"
				onChange={changeHandler}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>
			<HiOutlineSearch className="absolute top-1.5 right-2 text-base-content" />
			{query && isFocused && (
				<div className="absolute mt-3 h-[500px] w-full">
					<ul className="menu rounded-box menu-compact relative h-full w-[320px] flex-nowrap overflow-y-scroll border bg-base-100 p-2 text-left">
						<li className="menu-title">
							<span>Member</span>
						</li>
						{filteredMembers?.map((member) => {
							return (
								<li key={member.id} className="w-full">
									<a className="w-full">
										<div className="avatar">
											<div className="w-7 rounded-full border-base-content">
												<img src={member.avatar || defaultAvatar} width={20} height={20} alt="avatar" />
											</div>
										</div>
										<Compo value={member.username} highlight={query} />
									</a>
								</li>
							);
						})}
						<li className="menu-title">
							<span>Message</span>
						</li>
						{filteredMessages?.map((message) => {
							return (
								<li key={message.id} className="w-full">
									<a className="w-full">
										<span className="w-full break-words">
											<Compo value={message.text} highlight={query} />
										</span>
									</a>
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