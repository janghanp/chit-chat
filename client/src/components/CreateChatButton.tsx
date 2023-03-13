import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi';
import axios from 'axios';

import { AuthErrorResponse } from '../types';
import { createPortal } from 'react-dom';

const CreateChatButton = () => {
	const navigate = useNavigate();

	const [roomName, setRoomName] = useState<string>('');
	const [error, setError] = useState<string>('');

	const createChat = async () => {
		if (!roomName) {
			setError('Please provide a chatroom name');
			return;
		}

		// Check if a chat room to create already exists.
		try {
			await axios.post('http://localhost:8080/chat', { roomName: roomName }, { withCredentials: true });

			// A chat room has been created and redirect a user to the Chat page.
			navigate(`/chat/${roomName}`);

			// close the modal
			document.getElementById('modal-2')!.click();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 400) {
				//Chat room already exists.
				const serverError = error.response.data as AuthErrorResponse;
				setError(serverError.message);
				return;
			} else if (error instanceof Error) {
				console.log(error);
			}

			return;
		} finally {
			setRoomName('');
		}
	};

	return (
		<>
			<div className="tooltip tooltip-right w-min mt-3 pt-3 border-t-2 border-t-base-content" data-tip="Create a chat">
				<label htmlFor="modal-2" className="btn-outline btn-circle btn">
					<HiPlus className="text-xl" />
				</label>
			</div>

			{createPortal(
				<div>
					<input
						type="checkbox"
						id="modal-2"
						className="modal-toggle"
						onChange={() => {
							setError('');
							setRoomName('');
						}}
					/>

					<label htmlFor="modal-2" className="modal">
						<label className="modal-box relative">
							<label htmlFor="modal-2" className="btn-sm btn-circle btn absolute right-5 top-5">
								✕
							</label>
							<h3 className="text-center text-2xl font-bold">Create a chat</h3>
							<p className="py-4">Your chat is where you and your friends hang out. Make yours and start talking.</p>

							<div className="form-control my-5 w-full">
								<label className="label">
									<span className="label-text text-sm font-bold uppercase">chatroom name</span>
								</label>
								<input
									type="text"
									placeholder="Type here"
									className={`input-bordered input w-full ${error && 'border-error'}`}
									onChange={(e) => {
										setError('');
										setRoomName(e.target.value);
									}}
									value={roomName}
								/>
								{error && <span className="mt-2 text-sm text-error">{error}</span>}
							</div>

							<div className="w-full text-right">
								<button className="btn" onClick={createChat}>
									Create
								</button>
							</div>
						</label>
					</label>
				</div>,
				document.body
			)}
		</>
	);
};

export default CreateChatButton;
