import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCamera, HiPlus } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';
import { useMutation } from '@tanstack/react-query';

import { createPortal } from 'react-dom';
import { createChat } from '../api/chat';

interface Props {
	currentUserId: string;
	closeSidebar?: () => void;
}

const CreateChatButton = ({ currentUserId, closeSidebar }: Props) => {
	const navigate = useNavigate();
	const [roomName, setRoomName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [file, setFile] = useState<File | null>();
	const [preview, setPreview] = useState<string>();
	const [imageError, setImageError] = useState<string>();
	const [isOpen, setIsOpen] = useState<boolean>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { mutate, isLoading } = useMutation({
		mutationFn: (formData: FormData) => {
			return createChat(formData);
		},
		onSuccess: (data) => {
			setIsOpen(false);

			if (closeSidebar) {
				closeSidebar();
			}

			navigate(`/chat/${data.id}`);
		},
		onError: (error: any) => {
			setError(error.response.data.message);
		},
	});

	useEffect(() => {
		function handleKeydown(event: KeyboardEvent) {
			const key = event.key;

			if (key === 'Escape') {
				event.preventDefault();
				setIsOpen(false);
				clearStates();
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	}, []);

	const changeFileHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files![0];

		if (file) {
			if (file.size > 5000000) {
				setImageError('The image should be less than 5MB.');
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

	const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!roomName) {
			setError('Please provide a chatroom name');
			return;
		}

		if (error) {
			return;
		}

		const formData = new FormData();

		formData.append('file', file || '');
		formData.append('roomName', roomName);
		formData.append('ownerId', currentUserId);

		mutate(formData);
	};

	return (
		<div data-cy="create-chat-button">
			<div className="tooltip tooltip-top" data-tip="Create a chat">
				<button className="btn-ghost btn-sm btn btn-circle" onClick={() => setIsOpen(true)}>
					<HiPlus className="text-2xl" />
				</button>
			</div>

			{isOpen &&
				createPortal(
					<>
						<div
							className="fixed inset-0 z-40 bg-gray-400/50"
							onClick={() => {
								clearStates();
								setIsOpen(false);
							}}
						></div>
						<div className="card bg-base-100 fixed inset-0 z-50 mx-auto my-auto h-[470px] w-[500px] shadow-xl">
							<div className="card-body">
								<div className="relative">
									{isLoading && (
										<div className="absolute inset-0 z-30 cursor-not-allowed rounded-lg bg-gray-200 opacity-50"></div>
									)}
									<button
										className="btn-sm btn-outline btn-circle btn absolute right-0"
										onClick={() => {
											clearStates();
											setIsOpen(false);
										}}
									>
										✕
									</button>
									<h3 className="text-center text-2xl font-bold">Create a chat</h3>
									<p className="py-4">
										Your chat is where you and your friends hang out. Make yours and start talking.
									</p>
									<div className="form-control my-5 w-full">
										<div className="my-3 w-full text-center">
											<div
												className="avatar relative hover:cursor-pointer"
												onClick={() => fileInputRef.current?.click()}
											>
												<div className="ring-base-content w-20 rounded-full ring-2">
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
										<form onSubmit={submitHandler}>
											<label className="label">
												<span className="label-text text-sm font-bold uppercase">chatroom name</span>
											</label>
											<input
												disabled={isLoading}
												data-cy="create-chat-input"
												type="text"
												placeholder="Type here"
												className={`input-bordered input w-full ${error && 'border-error'}`}
												onChange={(e) => {
													setError('');
													setRoomName(e.target.value);
												}}
												value={roomName}
											/>
											{error && (
												<span className="text-error mt-2 text-sm" data-cy="create-chat-error">
													{error}
												</span>
											)}
											<div className="mt-5 w-full text-right">
												<button
													type="submit"
													className="btn"
													data-cy="create-chat-submit"
													disabled={isLoading || !roomName}
												>
													{isLoading ? <SyncLoader color="#021431" size={10} margin={4} /> : <span>create</span>}
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</>,
					document.body
				)}
		</div>
	);
};

export default CreateChatButton;
