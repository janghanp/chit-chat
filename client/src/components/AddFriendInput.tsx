import { useState } from 'react';

import useCreateNotification from '../hooks/useCreateNotification';
import useUser from '../hooks/useUser';
import { useMutation } from '@tanstack/react-query';
import { fetchUserByUsername } from '../api/user';

const AddFriendInput = () => {
	const { data: currentUser } = useUser();
	const { mutate: createNotificationMutate } = useCreateNotification();
	const { mutate: getUserMutate } = useMutation({
		mutationFn: ({ username }: { username: string }) => {
			return fetchUserByUsername(username);
		},
		onSuccess: async ({ data, status }) => {
			//if a receiver exists, create a notification for the receiver.
			if (data && status === 200) {
				createNotificationMutate({
					receiverId: data.id,
					message: `has sent you a friend request`,
					senderId: currentUser!.id,
				});

				setMessage('Your request has been sent successfully!');
			}

			if (status === 202) {
				setError('You are already a friend of him/her');
			}

			if (status === 204) {
				setError("Couldn't find the user...");
			}
		},
		onError: (error: any) => {
			console.log(error);
			setMessage('Something went wrong. please try again...');
		},
	});
	const [username, setUsername] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [error, setError] = useState<string>('');

	const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError('');
		setMessage('');
		setUsername(e.target.value);
	};

	const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setMessage('');

		if (!username) {
			return;
		}

		if (username === currentUser?.username) {
			setError(`You can't send a friend request to yourself...`);
			return;
		}

		getUserMutate({ username });
	};

	return (
		<div className="flex w-full flex-col items-start gap-y-3">
			<div className="w-full self-center">
				<span className="self-left text-2xl font-bold">Add Friend</span>
			</div>
			<form onSubmit={submitHandler} className="relative w-full self-center">
				<input
					type="text"
					placeholder="Enter a Username"
					className={`input-bordered input w-full shadow-md ${message && 'border-green-500'} ${
						error && 'border-error'
					}`}
					onChange={inputChangeHandler}
				/>
				<button className="btn-outline btn-sm btn absolute right-3 top-2 h-3/6 normal-case">Add Friend</button>
			</form>
			<div className="h-5 w-full">
				{message && <span className="text-green-500">{message}</span>}
				{error && <span className="text-error">{error}</span>}
			</div>
		</div>
	);
};

export default AddFriendInput;
