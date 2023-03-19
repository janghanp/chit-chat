import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCamera, HiPlus } from 'react-icons/hi';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';

import { AuthErrorResponse } from '../types';
import { createPortal } from 'react-dom';

interface Props {
	currentUserId: string;
}

const CreateChatButton = ({ currentUserId }: Props) => {
	const navigate = useNavigate();

	const [roomName, setRoomName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [file, setFile] = useState<File | null>();
	const [preview, setPreview] = useState<string>();
	const [imageError, setImageError] = useState<string>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const changeFileHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files![0];

		if (file) {
			if (file.size > 1000000) {
				setImageError('The image should be less than 1MB.');
				setFile(null);
				setPreview('');
				return;
			}

			const reader = new FileReader();

			reader.onloadend = () => {
				setFile(file);
				setPreview(reader.result as string);
				setImageError('');
			};

			reader.readAsDataURL(file);
		}
	};

	const clearStates = () => {
		setRoomName('');
		setFile(null);
		setPreview('');
		setError('');
		setImageError('');
	};

	const createChat = async () => {
		if (!roomName) {
			setError('Please provide a chatroom name');
			return;
		}

		if (error) {
			return;
		}

		try {
			setIsLoading(true);

			const formData = new FormData();

			formData.append('file', file || '');
			formData.append('roomName', roomName);
			formData.append('ownerId', currentUserId);

			const { data } = await axios.post('http://localhost:8080/chat', formData, { withCredentials: true });

			document.getElementById('modal-2')!.click();

			navigate(`/chat/${data.chatId}`);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 400) {
				//Chat room already exists.
				const serverError = error.response.data as AuthErrorResponse;
				setError(serverError.message);
			} else if (error instanceof Error) {
				console.log(error);
			}
		} finally {
			setIsLoading(false);
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
					<input type="checkbox" id="modal-2" className="modal-toggle" onChange={clearStates} />

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
									disabled={isLoading}
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
								<button className={`btn ${isLoading && 'pointer-events-none'}`} onClick={createChat}>
									{isLoading ? <SyncLoader color="#A3C6FF" size={10} margin={4} /> : <span>create</span>}
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
