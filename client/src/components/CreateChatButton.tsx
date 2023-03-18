import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCamera, HiPlus } from 'react-icons/hi';
import axios from 'axios';

import { AuthErrorResponse } from '../types';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const CreateChatButton = () => {
	const navigate = useNavigate();

	const [roomName, setRoomName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [preview, setPreview] = useState<string>();
	const [imageError, setImageError] = useState<string>();
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const uploadImage = async (image: File) => {
		setIsUploading(true);

		const formData = new FormData();

		formData.append('file', image!);
		formData.append('public_id', '');

		// const { data } = await axios.post<any>('http://localhost:8080/chat/icon', formData, {
		// 	withCredentials: true,
		// });

		setIsUploading(false);
	};

	const changeFileHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files![0];

		if (file) {
			if (file.size > 1000000) {
				setImageError('The image should be less than 1MB.');
				setPreview('');
				return;
			}

			const reader = new FileReader();

			reader.onloadend = () => {
				setPreview(reader.result as string);
				setImageError('');
			};

			reader.readAsDataURL(file);

			//TODO: How should the image be handled?
			//?: Upload it right away when chaing an image?
			//?: Upload it when clicking the create button?

			// toast.promise(uploadImage(file), {
			// 	loading: 'Saving...',
			// 	success: <b>Settings saved!</b>,
			// 	error: <b>Could not save.</b>,
			// });
		}
	};

	return (
		<div className="w-full p-4">
			<div className="tooltip tooltip-right w-full" data-tip="Create a chat">
				<label htmlFor="modal-2" className="btn-outline btn w-full">
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
						<label htmlFor="" className="modal-box relative">
							<label htmlFor="modal-2" className="btn-sm btn-circle btn absolute right-5 top-5">
								✕
							</label>
							<h3 className="text-center text-2xl font-bold">Create a chat</h3>
							<p className="py-4">Your chat is where you and your friends hang out. Make yours and start talking.</p>

							<div className="form-control my-5 w-full">
								{/* Chat icon */}
								<div className="my-3 w-full text-center">
									<div className="avatar relative hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
										<div className="w-20 rounded-full ring-2 ring-base-content">
											{preview ? (
												<img src={preview} alt="avatar" width={25} height={25} />
											) : (
												<div className="flex flex-col">
													<HiCamera className="mx-auto translate-y-1/2 text-4xl" />
													<div className="mt-3 text-sm">upload</div>
												</div>
											)}
										</div>
									</div>
								</div>

								{imageError && <span className="text-error">{imageError}</span>}

								<input
									type="file"
									disabled={isUploading}
									ref={fileInputRef}
									accept="image/png, image/gif, image/jpeg, image/jpg, image/webp"
									className="hidden"
									onChange={changeFileHandler}
								/>

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
		</div>
	);
};

export default CreateChatButton;
