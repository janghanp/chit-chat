import { HiPlus } from 'react-icons/hi';

interface Props {
	toggleModal: () => void;
}

const CreateChatButton = ({ toggleModal }: Props) => {
	return (
		<div className="tooltip tooltip-right" data-tip="Create a chat">
			<button className="btn-outline btn-circle btn" onClick={toggleModal}>
				<span className="text-xl">
					<HiPlus />
				</span>
			</button>
		</div>
	);
};

export default CreateChatButton;
