import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { HiCamera } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

import { AuthErrorResponse, AxiosResponseWithUsername, User } from '../types';
import { useUser } from '../context/UserContext';
import defaultImageUrl from '/default.jpg';

interface FormData {
	email: string;
	newPassword: string;
	confirmNewPassword: string;
	username: string;
}

interface Props {
	closeSettings: () => void;
}

const Settings = ({ closeSettings }: Props) => {
	const { currentUser, setCurrentUser } = useUser();

	const [preview, setPreview] = useState<string>(currentUser!.avatar || '');
	const [imageError, setImageError] = useState<string>();
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			email: currentUser!.email,
			username: currentUser!.username,
		},
	});

	useEffect(() => {
		function handleKeydown(event: KeyboardEvent) {
			const key = event.key;

			if (key === 'Escape') {
				event.preventDefault();
				closeSettings();
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	}, [closeSettings]);

	// Determining permission of submit button.
	let isDisable = true;
	const watchNewPassword = watch('newPassword');
	const watchConfirmNewPassword = watch('confirmNewPassword');
	const watchUsername = watch('username');

	if ((currentUser!.username !== watchUsername && watchUsername) || watchNewPassword || watchConfirmNewPassword) {
		isDisable = false;
	}

	const onSubmit = handleSubmit(async (formData) => {
		const { newPassword, confirmNewPassword, username } = formData;

		// Check if password and confirmPassword match
		if (newPassword !== confirmNewPassword) {
			setError('newPassword', {
				type: 'match',
				message: 'Passwords should match',
			});

			return;
		}

		let dataToUpdate: { newPassword?: string; username?: string } = {};

		// User trying to chagne their password.
		if (newPassword && confirmNewPassword) {
			dataToUpdate.newPassword = newPassword;
		}

		// User tyring to chagne their username.
		if (username && username !== currentUser!.username) {
			console.log(username, currentUser!.username);

			dataToUpdate.username = username;
		}

		try {
			const { data } = await axios.patch<AxiosResponseWithUsername>('http://localhost:8080/user', dataToUpdate, {
				withCredentials: true,
			});

			setCurrentUser((prev) => ({ ...prev!, username: data.username }));

			closeSettings();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 400) {
				// Set an error into username field.
				const serverError = error.response.data as AuthErrorResponse;

				setError('username', { type: 'taken', message: serverError.message });
			} else if (error instanceof Error) {
				console.log(error);
			}
		}
	});

	const uploadImage = async (image: File) => {
		setIsUploading(true);

		const formData = new FormData();

		formData.append('file', image!);
		formData.append('public_id', currentUser!.public_id || '');

		const { data } = await axios.post<User>('http://localhost:8080/user/avatar', formData, {
			withCredentials: true,
		});

		setCurrentUser(data);
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

			toast.promise(uploadImage(file), {
				loading: 'Uploading...',
				success: <b>Image uploaded!</b>,
				error: <b>Could not upload the image.</b>,
			});
		}
	};

	return (
		<div className="fixed inset-0 z-40 bg-base-300">
			<div className="mx-auto max-w-xl translate-y-40 rounded-md bg-base-100 p-5 shadow-md">
				<div className="flex flex-row items-center justify-between">
					<div className="text-base-con mb-5 text-3xl font-bold">User Settings</div>
					<div className="flex flex-col items-center justify-center gap-y-3">
						<button className="btn-outline btn-circle btn" onClick={closeSettings}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<kbd className="kbd kbd-sm">ESC</kbd>
					</div>
				</div>
				<Toaster />

				<div className="mt-14 w-full text-center">
					<div className="avatar relative hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
						<div className="w-20 rounded-full ring-2 ring-base-content">
							<img src={preview || defaultImageUrl} alt="avatar" width={25} height={25} />
						</div>
						<div className="absolute inset-0 z-10 rounded-full border text-xs font-semibold text-base-content opacity-0 duration-300 hover:bg-black hover:bg-opacity-10 hover:opacity-100">
							<HiCamera className="mx-auto translate-y-1/2 text-4xl" />
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

				<form className="mt-5" onSubmit={onSubmit}>
					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Email</span>
						</label>

						<input
							className="input-bordered input w-full border hover:cursor-not-allowed disabled:text-gray-400"
							disabled
							{...register('email', {
								required: { value: true, message: 'Email is required' },
								pattern: {
									value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
									message: 'Invalid email',
								},
							})}
							aria-invalid={errors.email ? 'true' : 'false'}
						/>
					</div>

					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">New Password</span>
						</label>

						<input
							className={`input-bordered input w-full border ${errors.newPassword && 'border-error'}`}
							type="password"
							{...register('newPassword')}
						/>

						{errors.newPassword?.type === 'match' && (
							<span role="alert" className="text-error">
								{errors.newPassword.message}
							</span>
						)}
					</div>

					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Confirm New Password</span>
						</label>

						<input className="input-bordered input w-full border" type="password" {...register('confirmNewPassword')} />
					</div>

					<div className="form-controla w-full">
						<label className="label">
							<span className="label-text">Username</span>
						</label>

						<input
							className={`input-bordered input w-full border ${errors.username && 'border-error'}`}
							{...register('username', {
								required: { value: true, message: 'Username is required' },
							})}
						/>

						{errors.username?.type === 'required' && (
							<span role="alert" className="text-error">
								{errors.username.message}
							</span>
						)}

						{errors.username?.type === 'taken' && (
							<span role="alert" className="text-error">
								{errors.username.message}
							</span>
						)}
					</div>

					<div className="w-full text-right">
						<button
							type="submit"
							className="btn mt-5 disabled:cursor-not-allowed disabled:text-gray-300"
							disabled={isDisable}
						>
							Update
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Settings;
