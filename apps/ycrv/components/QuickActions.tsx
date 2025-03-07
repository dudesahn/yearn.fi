import {Button} from '@yearn-finance/web-lib/components/Button';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {isZero} from '@yearn-finance/web-lib/utils/isZero';
import {Dropdown} from '@common/components/TokenDropdown';
import {IconArrowRight} from '@common/icons/IconArrowRight';

import type {ChangeEvent, ReactElement, ReactNode} from 'react';
import type {TDropdownOption} from '@common/types/types';

export type TQASelect = {
	label: string;
	legend?: string;
	options: TDropdownOption[];
	selected?: TDropdownOption;
	onSelect?: (option: TDropdownOption) => void;
};

export type TQAInput = {
	label?: string;
	legend?: string;
	className?: string;
	value?: string | number;
	isDisabled?: boolean;
	isMaxDisabled?: boolean;
	onSetMaxAmount?: () => void;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export type TQAButton = {
	label: string;
	className?: string;
	isBusy?: boolean;
	isDisabled?: boolean;
	onClick: VoidFunction;
};

function QASelect(props: TQASelect): ReactElement {
	const {label, legend, options, selected, onSelect} = props;

	function renderMultipleOptionsFallback(): ReactElement {
		return (
			<Dropdown
				defaultOption={options[0]}
				options={options}
				selected={selected}
				onSelect={onSelect ? onSelect : (): void => undefined}
			/>
		);
	}

	return (
		<div className={'relative z-10 w-full space-y-2'}>
			<div className={'flex flex-row items-baseline justify-between'}>
				<label className={'text-base text-neutral-600'}>{label}</label>
				<legend
					className={'font-number inline text-xs text-neutral-600 md:hidden'}
					suppressHydrationWarning>
					{legend}
				</legend>
			</div>

			<Renderable
				fallback={renderMultipleOptionsFallback()}
				shouldRender={isZero(options.length)}>
				<div
					className={
						'flex h-10 w-full items-center justify-between bg-neutral-0 px-2 text-base text-neutral-900 md:px-3'
					}>
					<div className={'relative flex flex-row items-center'}>
						<div
							key={selected?.value}
							className={'h-6 w-6 flex-none rounded-full'}>
							{selected?.icon}
						</div>
						<p
							className={
								'overflow-x-hidden text-ellipsis whitespace-nowrap pl-2 font-normal text-neutral-900 scrollbar-none'
							}>
							{selected?.symbol}
						</p>
					</div>
				</div>
			</Renderable>
			<legend
				className={'font-number hidden text-xs text-neutral-600 md:inline'}
				suppressHydrationWarning>
				{legend}
			</legend>
		</div>
	);
}

function QASwitch(): ReactElement {
	return (
		<div className={'mx-auto flex w-full justify-center space-y-0 md:mx-none md:block md:w-14 md:space-y-2'}>
			<label className={'hidden text-base md:inline'}>&nbsp;</label>

			<div className={'flex h-6 w-6 rotate-90 items-center justify-center p-0 md:h-10 md:w-14 md:rotate-0'}>
				<IconArrowRight className={'w-4 text-neutral-400 md:w-[25px]'} />
			</div>
			<legend className={'hidden text-xs md:inline'}>&nbsp;</legend>
		</div>
	);
}

function QAInput(props: TQAInput): ReactElement {
	const {className, label, legend, value, isDisabled, isMaxDisabled, onChange, onSetMaxAmount, type, ...inputProps} =
		props;

	return (
		<div className={className ? className : 'w-full space-y-2'}>
			{!!label && (
				<label
					htmlFor={label}
					className={'hidden text-base text-neutral-600 md:inline'}>
					{label}
				</label>
			)}
			<div className={`flex h-10 items-center ${isDisabled ? 'bg-neutral-300' : 'bg-neutral-0'} p-2`}>
				<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
					<input
						id={inputProps.id || label}
						className={`w-full overflow-x-scroll border-none bg-transparent px-0 font-bold outline-none scrollbar-none ${
							isDisabled ? 'cursor-not-allowed' : 'cursor-default'
						}`}
						type={type || 'text'}
						disabled={isDisabled}
						value={value}
						onChange={onChange}
						{...inputProps}
					/>
					{onSetMaxAmount && (
						<button
							onClick={!isMaxDisabled ? onSetMaxAmount : undefined}
							className={`ml-2 px-2 py-1 text-xs font-normal text-neutral-0 transition-colors ${
								isMaxDisabled
									? 'cursor-not-allowed bg-neutral-300 hover:bg-neutral-300'
									: 'cursor-pointer bg-neutral-900 hover:bg-neutral-700'
							}`}
							disabled={isMaxDisabled}>
							{'Max'}
						</button>
					)}
				</div>
			</div>
			<legend className={'font-number mr-1 text-end text-xs text-neutral-600 md:mr-0 md:text-start'}>
				{legend}
			</legend>
		</div>
	);
}

function QAButton({label, ...props}: TQAButton): ReactElement {
	return (
		<div className={'w-full space-y-0 md:w-42 md:min-w-42 md:space-y-2'}>
			<label className={'hidden text-base md:inline'}>&nbsp;</label>
			<div>
				<Button
					className={'w-full'}
					{...props}>
					{label}
				</Button>
			</div>
			<legend className={'hidden text-xs md:inline'}>&nbsp;</legend>
		</div>
	);
}

export function QuickActions({label, children}: {label: string; children: ReactNode}): ReactElement {
	return (
		<section
			aria-label={label}
			className={'flex w-full flex-col space-x-0 md:flex-row md:space-x-4'}>
			{children}
		</section>
	);
}

QuickActions.Select = QASelect;
QuickActions.Switch = QASwitch;
QuickActions.Input = QAInput;
QuickActions.Button = QAButton;
