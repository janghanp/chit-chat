import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import { AuthErrorResponse, AxiosResponseWithUser, AxiosResponseWithUsername } from '../types';
import { useUser } from '../context/UserContext';
import defaultImageUrl from '/default.jpg';

interface FormData {
	email: string;
	newPassword: string;
	confirmNewPassword: string;
	username: string;
}

const Settings = () => {
	const { currentUser, setCurrentUser } = useUser();

	const navigate = useNavigate();

	const [image, setImage] = useState<File | null>();
	const [preview, setPreview] = useState<string>(currentUser!.avatar || '');
	const [imageError, setImageError] = useState<string>();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isLoading, setIsLoading] = useState<boolean>(false);

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

	// Determining permission of submit button.
	let isDisable = true;
	const watchNewPassword = watch('newPassword');
	const watchConfirmNewPassword = watch('confirmNewPassword');
	const watchUsername = watch('username');

	if ((currentUser!.username !== watchUsername && watchUsername) || watchNewPassword || watchConfirmNewPassword) {
		isDisable = false;
	}

	// Upload an image when the image is chagned.
	useEffect(() => {
		const uploadImage = async () => {
			setIsLoading(true);

			const formData = new FormData();
			formData.append('file', image!);
			formData.append('public_id', currentUser!.public_id || '');

			const { data } = await axios.post<AxiosResponseWithUser>('http://localhost:8080/user/profile', formData, {
				withCredentials: true,
			});

			// Chagne currentUser state in UserContext.
			setCurrentUser(data);

			setIsLoading(false);
		};

		//Since the avatar string is set to preview state, even if a use has an avatar, uploadImage won't be executed.
		if (image && !imageError) {
			uploadImage();
		}
	}, [currentUser, image, imageError, setCurrentUser]);

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

			// Change currentUser state.
			setCurrentUser((prev) => ({ ...prev!, username: data.username }));

			navigate('/');
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
				setImage(file);
				setPreview(reader.result as string);
				setImageError('');
			};

			reader.readAsDataURL(file);
		}
	};

	return (
		<div>
			<img className="border" src={preview || defaultImageUrl} alt="avatar" width={50} height={50} />

			{imageError && <p>{imageError}</p>}

			<label>Your Image File</label>
			<input
				type="file"
				ref={fileInputRef}
				accept="image/png, image/gif, image/jpeg, image/jpg, image/webp"
				onChange={changeFileHandler}
			/>

			<form onSubmit={onSubmit}>
				<label>Email</label>
				<input
					className="border disabled:text-gray-400 hover:cursor-not-allowed"
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

				{errors.email?.type === 'taken' && <p role="alert">{errors.email.message}</p>}

				<label>New Password</label>
				<input className="border" type="password" {...register('newPassword')} />

				{errors.newPassword?.type === 'match' && <p role="alert">{errors.newPassword.message}</p>}

				<label>Confirm New Password</label>
				<input className="border" type="password" {...register('confirmNewPassword')} />

				<label>Username</label>
				<input
					className="border"
					{...register('username', {
						required: { value: true, message: 'Username is required' },
					})}
				/>

				{errors.username?.type === 'required' && <p role="alert">{errors.username.message}</p>}

				{errors.username?.type === 'taken' && <p role="alert">{errors.username.message}</p>}

				<button type="submit" className="disabled:cursor-not-allowed disabled:text-gray-300" disabled={isDisable}>
					Update
				</button>
			</form>
		</div>
	);
};

export default Settings;
