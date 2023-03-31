import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiCamera, HiOutlineX } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';

import { updateChat } from '../api/chat';
import useChat from '../hooks/useChat';

interface Props {
	chatId: string;
	currentUserId: string;
}

const ChatSettings = ({ chatId, currentUserId }: Props) => {
	const { data } = useChat(chatId, currentUserId);

	const { isLoading, mutate } = useMutation({
		mutationFn: (formData: FormData) => {
			return updateChat(formData);
		},
		onSuccess: (data) => {
			window.location.href = '/';
		},
		onError: (error: any) => {
			if (error.response.status === 400) {
				setError(error.response.data.message);
			}

			console.log(error);
		},
	});

	const [roomName, setRoomName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [file, setFile] = useState<File | null>();
	const [preview, setPreview] = useState<string>();
	const [imageError, setImageError] = useState<string>();
	const [a, b] = useState<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (data) {
			setRoomName(data?.chat.name!);
			setPreview(data.chat.icon || '');
		}
	}, [data]);

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

	const submitHandler = async () => {
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
		formData.append('chatId', data?.chat.id!);

		mutate(formData);
	};

	const deletePreviewHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.stopPropagation();

		console.log('click');

		setPreview('');
		setFile(null);
	};

	return (
		<>
			{createPortal(
				<div className="">
					<input type="checkbox" id="modal-3" className="modal-toggle" />
					<label htmlFor="modal-3" className="modal">
						<label htmlFor="" className="modal-box relative">
							<label htmlFor="modal-3" className="btn-sm btn-circle btn absolute right-5 top-5">
								✕
							</label>
							<h3 className="text-center text-2xl font-bold">Settings</h3>
							<div className="form-control my-5 w-full">
								<div className="my-3 w-full text-center">
									<div className="avatar relative hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
										<div className="group w-20 rounded-full ring-2 ring-base-content">
											{preview ? (
												<>
													<img src={preview} alt="avatar" width={25} height={25} />
													<div className="absolute inset-0 rounded-full transition duration-200 group-hover:bg-gray-300/50">
														<div className="absolute -top-2 -right-1 hidden group-hover:block">
															<button
																className="btn-outline btn-sm btn-circle btn bg-base-100"
																onClick={deletePreviewHandler}
															>
																<HiOutlineX />
															</button>
														</div>
														<HiCamera className="mx-auto translate-y-1/2 text-4xl" />
														<div className="mt-3 text-sm">upload</div>
													</div>
												</>
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
								<button className={`btn ${isLoading && 'pointer-events-none'}`} onClick={submitHandler}>
									{isLoading ? <SyncLoader color="#A3C6FF" size={10} margin={4} /> : <span>update</span>}
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

export default ChatSettings;
