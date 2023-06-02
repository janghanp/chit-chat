interface Props {
	index: number;
}

const ChatRoomSkeleton = ({ index }: Props) => {
	let bgColor;

	switch (index) {
		case 0:
			bgColor = 'bg-slate-400';
			break;
		case 1:
			bgColor = 'bg-slate-300';
			break;
		case 2:
			bgColor = 'bg-slate-200';
			break;
		case 3:
			bgColor = 'bg-slate-200';
			break;
		case 4:
			bgColor = 'bg-slate-100';
			break;

		default:
			break;
	}

	return (
		<div className="mx-auto h-[68px] w-full max-w-sm p-4 shadow">
			<div className="flex animate-pulse space-x-4">
				<div className={`h-10 w-10 rounded-full ${bgColor}`}></div>
				<div className="flex-1 space-y-6 py-1">
					<div className="space-y-3">
						<div className="grid grid-cols-3 gap-4">
							<div className={`col-span-1 h-2 rounded ${bgColor}`}></div>
							<div className="col-span-1 h-2 rounded"></div>
							<div className={`col-span-1 h-2 rounded ${bgColor}`}></div>
						</div>
						<div className={`h-2 rounded ${bgColor}`}></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatRoomSkeleton;
