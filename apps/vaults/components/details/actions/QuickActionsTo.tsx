import {useActionFlow} from '@vaults/contexts/useActionFlow';
import {useSolver} from '@vaults/contexts/useSolver';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatPercent} from '@yearn-finance/web-lib/utils/format.number';
import {formatCounterValue} from '@yearn-finance/web-lib/utils/format.value';
import {Dropdown} from '@common/components/TokenDropdown';
import {useTokenPrice} from '@common/hooks/useTokenPrice';

import type {ReactElement} from 'react';

export function VaultDetailsQuickActionsTo(): ReactElement {
	const {isActive} = useWeb3();
	const {currentVault, possibleOptionsTo, actionParams, onUpdateSelectedOptionTo, isDepositing} = useActionFlow();
	const {expectedOut, isLoadingExpectedOut} = useSolver();
	const selectedOptionToPricePerToken = useTokenPrice(toAddress(actionParams?.selectedOptionTo?.value));
	const isMigrationAvailable = currentVault?.migration?.available;

	function renderMultipleOptionsFallback(): ReactElement {
		return (
			<Dropdown
				defaultOption={possibleOptionsTo[0]}
				options={possibleOptionsTo}
				selected={actionParams?.selectedOptionTo}
				onSelect={onUpdateSelectedOptionTo}
			/>
		);
	}

	return (
		<section
			aria-label={'TO'}
			className={'flex w-full flex-col space-x-0 md:flex-row md:space-x-4'}>
			<div className={'relative z-10 w-full space-y-2'}>
				<div className={'flex flex-row items-baseline justify-between'}>
					<label className={'text-base text-neutral-600'}>
						{isDepositing || isMigrationAvailable ? 'To vault' : 'To wallet'}
					</label>
					<legend
						className={'font-number inline text-xs text-neutral-600 md:hidden'}
						suppressHydrationWarning>
						{`APR ${formatPercent(
							(currentVault.apr.netAPR + currentVault.apr.extra.stakingRewardsAPR) * 100,
							2,
							2,
							500
						)}`}
					</legend>
				</div>
				<Renderable
					shouldRender={!isActive || isDepositing || possibleOptionsTo.length === 1}
					fallback={renderMultipleOptionsFallback()}>
					<div
						className={
							'flex h-10 w-full items-center justify-between bg-neutral-300 px-2 text-base text-neutral-900 md:px-3'
						}>
						<div className={'relative flex flex-row items-center truncate'}>
							<div className={'h-6 w-6 flex-none rounded-full'}>
								{actionParams?.selectedOptionTo?.icon}
							</div>
							<p
								className={
									'truncate whitespace-nowrap pl-2 font-normal text-neutral-900 scrollbar-none'
								}>
								{actionParams?.selectedOptionTo?.symbol}
							</p>
						</div>
					</div>
				</Renderable>
				<legend
					className={'font-number hidden text-xs text-neutral-600 md:inline'}
					suppressHydrationWarning>
					{isDepositing
						? formatPercent(
								(currentVault.apr.netAPR + currentVault.apr.extra.stakingRewardsAPR) * 100,
								2,
								2,
								500
						  )
						: ''}
				</legend>
			</div>

			<div className={'w-full space-y-2'}>
				<label
					htmlFor={'toAmount'}
					className={'hidden text-base text-neutral-600 md:inline'}>
					{'You will receive'}
				</label>
				<div className={'flex h-10 items-center bg-neutral-300 p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
						{isLoadingExpectedOut ? (
							<div className={'relative h-10 w-full'}>
								<div className={'absolute left-3 flex h-10 items-center justify-center'}>
									<span className={'loader'} />
								</div>
							</div>
						) : (
							<input
								id={'toAmount'}
								className={
									'w-full cursor-default overflow-x-scroll border-none bg-transparent px-0 py-4 font-bold outline-none scrollbar-none'
								}
								type={'text'}
								disabled
								value={expectedOut?.normalized || 0}
								autoComplete={'off'}
							/>
						)}
					</div>
				</div>
				<legend
					suppressHydrationWarning
					className={'font-number mr-1 text-end text-xs text-neutral-600 md:mr-0 md:text-start'}>
					{formatCounterValue(expectedOut?.normalized || 0, selectedOptionToPricePerToken)}
				</legend>
			</div>
		</section>
	);
}
