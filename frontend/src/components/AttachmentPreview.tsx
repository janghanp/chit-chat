import { Dispatch, SetStateAction } from 'react';
import { HiTrash } from 'react-icons/hi2';
import { BarLoader } from 'react-spinners';
import { useMutation } from '@tanstack/react-query';

import { deleteAttachments } from '../api/chat';
import { Attachment } from '../types';

interface Props {
	attachment: Attachment;
	setAttachments: Dispatch<SetStateAction<Attachment[]>>;
	chatId: string;
}

const AttachmentPreview = ({ chatId, attachment, setAttachments }: Props) => {
	const { mutate: deleteAttachmentsMutate } = useMutation({
		mutationFn: ({ chatId, public_id }: { chatId: string; public_id: string }) => {
			return deleteAttachments(chatId, public_id);
		},
		onMutate() {
			setAttachments((prev) => {
				return prev.filter((el) => el.id !== attachment.id);
			});
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.log(error);
		},
	});

	const deleteAttachMentHandler = () => {
		deleteAttachmentsMutate({ chatId, public_id: attachment.public_id! });
	};

	return (
		<div className="relative flex h-56 w-56 items-center justify-center rounded-md border p-3 shadow-sm transition duration-300 hover:bg-gray-200">
			{attachment.isUploading ? (
				<div>
					<BarLoader color="#394E6A" />
				</div>
			) : (
				<>
					<div className="absolute right-2 top-2 z-20">
						<button
							className="btn btn-sm btn-error btn-square btn-outline bg-base-100 text-error"
							onClick={deleteAttachMentHandler}
						>
							<HiTrash />
						</button>
					</div>
					<img src={attachment.preview} alt="Loading..." />
				</>
			)}
		</div>
	);
};

export default AttachmentPreview;