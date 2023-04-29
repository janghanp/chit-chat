import { Fragment, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';

import Friend from '../components/Friend';
import useFriends from '../hooks/useFriends';
import AddFriendInput from '../components/AddFriendInput';
import { socket } from '../socket';
import { Friend as FriendType } from '../types';

const Friends = () => {
	const { isLoading, isError, data } = useFriends();

	useEffect(() => {
		if (data) {
			socket.emit('fetch_members');
		}
	}, [data]);

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<div className="bg-base-100 flex h-full w-full flex-col items-center justify-center rounded-md p-3">
			{isLoading ? (
				<div className="my-auto">
					<SyncLoader margin={10} color="#394E6A" size={10} />
				</div>
			) : (
				<div className="mt-20 h-full w-full max-w-2xl">
					<AddFriendInput />
					<div className="text-base-content text-2xl font-bold">Friends list</div>
					<div className="h-full w-full p-5">
						<div className="w-full">
							{data &&
								data.map((friend: FriendType) => {
									return (
										<Fragment key={friend.id}>
											<Friend friend={friend} />
										</Fragment>
									);
								})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Friends;
