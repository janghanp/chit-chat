import { Fragment } from 'react';

import Friend from '../components/Friend';
import useFriends from '../hooks/useFriends';

const Friends = () => {
	const { isLoading, isError, data } = useFriends();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<div className="flex h-screen w-full flex-col items-center justify-start p-5 sm:pl-[345px]">
			<div className="my-10 text-xl font-bold text-base-content">Friends list</div>
			<div className="h-screen w-full max-w-3xl p-5">
				<div className="w-full">
					{data &&
						data.map((friend: any) => {
							return (
								<Fragment key={friend.id}>
									<Friend friend={friend} />
								</Fragment>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default Friends;
