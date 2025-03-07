import {useMemo} from 'react';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {
	CRV_TOKEN_ADDRESS,
	LPYCRV_TOKEN_ADDRESS,
	LPYCRV_V2_TOKEN_ADDRESS,
	YCRV_CURVE_POOL_ADDRESS,
	YCRV_CURVE_POOL_V2_ADDRESS,
	YCRV_TOKEN_ADDRESS
} from '@yearn-finance/web-lib/utils/constants';
import {formatToNormalizedValue, toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatCounterValue} from '@yearn-finance/web-lib/utils/format.value';
import {handleInputChangeEventValue} from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';
import {isZero} from '@yearn-finance/web-lib/utils/isZero';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {Dropdown} from '@common/components/TokenDropdown';
import {useWallet} from '@common/contexts/useWallet';
import {useYearn} from '@common/contexts/useYearn';
import {ArrowDown} from '@common/icons/ArrowDown';
import {CardTransactorContextApp, useCardTransactor} from '@yCRV/components/CardTransactorWrapper';
import {ZAP_OPTIONS_FROM, ZAP_OPTIONS_TO} from '@yCRV/constants/tokens';

import type {ChangeEvent, ReactElement} from 'react';
import type {TDropdownOption} from '@common/types/types';

function CardZap(): ReactElement {
	const {isActive} = useWeb3();
	const {getToken, getBalance} = useWallet();
	const {vaults, prices} = useYearn();
	const {
		txStatusApprove,
		txStatusZap,
		selectedOptionFrom,
		set_selectedOptionFrom,
		selectedOptionTo,
		set_selectedOptionTo,
		amount,
		set_amount,
		set_hasTypedSomething,
		fromVaultAPY,
		toVaultAPY,
		expectedOutWithSlippage,
		allowanceFrom,
		onApproveFrom,
		onZap,
		onIncreaseCRVAllowance
	} = useCardTransactor();

	const ycrvPrice = useMemo(
		(): number => formatToNormalizedValue(toBigInt(prices?.[YCRV_TOKEN_ADDRESS] || 0), 6),
		[prices]
	);

	const ycrvCurvePoolPrice = useMemo(
		(): number => formatToNormalizedValue(toBigInt(prices?.[YCRV_CURVE_POOL_ADDRESS] || 0), 6),
		[prices]
	);

	/* 🔵 - Yearn Finance ******************************************************
	 ** useMemo to get the current possible TO vaults path for the current FROM
	 **************************************************************************/
	const possibleTo = useMemo((): TDropdownOption[] => {
		if (selectedOptionFrom.value === LPYCRV_TOKEN_ADDRESS) {
			const possibleOptions = ZAP_OPTIONS_TO.filter(
				(option): boolean => option.value === LPYCRV_V2_TOKEN_ADDRESS
			);
			if (selectedOptionTo.value !== LPYCRV_V2_TOKEN_ADDRESS) {
				set_selectedOptionTo(possibleOptions[0]);
			}
			return possibleOptions;
		}
		if (selectedOptionFrom.value === YCRV_CURVE_POOL_ADDRESS) {
			const possibleOptions = ZAP_OPTIONS_TO.filter((option): boolean => option.value === LPYCRV_TOKEN_ADDRESS);
			if (selectedOptionTo.value !== LPYCRV_TOKEN_ADDRESS) {
				set_selectedOptionTo(possibleOptions[0]);
			}
			return possibleOptions;
		}
		if (selectedOptionFrom.value === YCRV_CURVE_POOL_V2_ADDRESS) {
			const possibleOptions = ZAP_OPTIONS_TO.filter(
				(option): boolean => option.value === LPYCRV_V2_TOKEN_ADDRESS
			);
			if (selectedOptionTo.value !== LPYCRV_V2_TOKEN_ADDRESS) {
				set_selectedOptionTo(possibleOptions[0]);
			}
			return possibleOptions;
		}
		return ZAP_OPTIONS_TO.filter((option): boolean => option.value !== selectedOptionFrom.value);
	}, [selectedOptionFrom.value, selectedOptionTo.value, ZAP_OPTIONS_TO]);

	function renderButton(): ReactElement {
		const balanceForInputToken = getBalance({
			address: selectedOptionFrom.value,
			chainID: selectedOptionFrom.chainID
		}).raw;
		const isAboveBalance = amount.raw > balanceForInputToken || isZero(balanceForInputToken);
		const isAboveAllowance = amount.raw > allowanceFrom;

		if (txStatusApprove.pending || isAboveAllowance) {
			if (allowanceFrom > 0n && toAddress(selectedOptionFrom.value) === CRV_TOKEN_ADDRESS) {
				return (
					<Button
						onClick={onIncreaseCRVAllowance}
						className={'w-full'}
						isBusy={txStatusApprove.pending}
						isDisabled={!isActive || isZero(amount.raw) || isAboveBalance}>
						{'Increase Allowance'}
					</Button>
				);
			}
			return (
				<Button
					onClick={onApproveFrom}
					className={'w-full'}
					isBusy={txStatusApprove.pending}
					isDisabled={!isActive || isZero(amount.raw) || isAboveBalance}>
					{isAboveBalance ? 'Insufficient balance' : `Approve ${selectedOptionFrom?.label || 'token'}`}
				</Button>
			);
		}

		return (
			<Button
				onClick={onZap}
				className={'w-full'}
				isBusy={txStatusZap.pending}
				isDisabled={!isActive || isZero(amount.raw) || amount.raw > balanceForInputToken}>
				{isAboveBalance && !isZero(amount.raw) ? 'Insufficient balance' : 'Swap'}
			</Button>
		);
	}

	return (
		<>
			<div className={'grid grid-cols-2 gap-4'}>
				<label className={'relative z-20 flex flex-col space-y-1'}>
					<p className={'text-base text-neutral-600'}>{'Swap from'}</p>
					<Dropdown
						defaultOption={ZAP_OPTIONS_FROM[0]}
						options={ZAP_OPTIONS_FROM}
						selected={selectedOptionFrom}
						onSelect={(option: TDropdownOption): void => {
							performBatchedUpdates((): void => {
								if (option.value === selectedOptionTo.value) {
									set_selectedOptionTo(
										ZAP_OPTIONS_TO.find(
											(o: TDropdownOption): boolean => o.value !== option.value
										) as TDropdownOption
									);
								}
								set_selectedOptionFrom(option);
								set_amount(
									toNormalizedBN(getBalance({address: option.value, chainID: option.chainID}).raw)
								);
							});
						}}
					/>
					<p
						suppressHydrationWarning
						className={'pl-2 !text-xs font-normal !text-green-600'}>
						{fromVaultAPY}
					</p>
				</label>
				<div className={'flex flex-col space-y-1'}>
					<label
						htmlFor={'amount'}
						className={'text-base text-neutral-600'}>
						{'Amount'}
					</label>
					<div className={'flex h-10 items-center bg-neutral-100 p-2'}>
						<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
							<input
								id={'amount'}
								suppressHydrationWarning
								className={`w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-bold outline-none scrollbar-none ${
									isActive ? '' : 'cursor-not-allowed'
								}`}
								type={'text'}
								disabled={!isActive}
								value={amount.normalized}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									performBatchedUpdates((): void => {
										set_amount(
											handleInputChangeEventValue(
												e.target.value,
												getToken({
													address: selectedOptionFrom.value,
													chainID: selectedOptionFrom.chainID
												}).decimals || 18
											)
										);
										set_hasTypedSomething(true);
									});
								}}
							/>
							<button
								onClick={(): void =>
									set_amount(
										toNormalizedBN(
											getBalance({
												address: selectedOptionFrom.value,
												chainID: selectedOptionFrom.chainID
											}).raw
										)
									)
								}
								className={
									'cursor-pointer text-sm text-neutral-500 transition-colors hover:text-neutral-900'
								}>
								{'max'}
							</button>
						</div>
					</div>
					<p
						suppressHydrationWarning
						className={'pl-2 text-xs font-normal text-neutral-600'}>
						{formatCounterValue(
							amount?.normalized || 0,
							toAddress(selectedOptionFrom.value) === YCRV_TOKEN_ADDRESS
								? ycrvPrice || 0
								: toAddress(selectedOptionFrom.value) === YCRV_CURVE_POOL_ADDRESS
								? ycrvCurvePoolPrice || 0
								: Number(
										getToken({
											address: selectedOptionFrom.value,
											chainID: selectedOptionFrom.chainID
										}).price.normalized
								  ) ||
								  vaults?.[toAddress(selectedOptionFrom.value)]?.tvl?.price ||
								  0
						)}
					</p>
				</div>
			</div>

			<div className={'mb-4 mt-2 hidden grid-cols-2 gap-4 md:grid lg:mb-10 lg:mt-8'}>
				<div className={'flex items-center justify-center'}>
					<ArrowDown />
				</div>
				<div className={'flex items-center justify-center'}>
					<ArrowDown />
				</div>
			</div>

			<div className={'mb-8 mt-4 grid grid-cols-2 gap-4 md:mt-0'}>
				<label className={'relative z-10 flex flex-col space-y-1'}>
					<p className={'text-base text-neutral-600'}>{'Swap to'}</p>
					<Dropdown
						defaultOption={possibleTo[0]}
						options={possibleTo}
						selected={selectedOptionTo}
						onSelect={(option: TDropdownOption): void => set_selectedOptionTo(option)}
					/>
					<p
						suppressHydrationWarning
						className={'pl-2 !text-xs font-normal !text-green-600'}>
						{toVaultAPY}
					</p>
				</label>
				<div className={'flex flex-col space-y-1'}>
					<div>
						<p className={'hidden text-base text-neutral-600 md:block'}>{'You will receive minimum'}</p>
						<p className={'block text-base text-neutral-600 md:hidden'}>{'You will receive min'}</p>
					</div>
					<div className={'flex h-10 items-center bg-neutral-300 p-2'}>
						<b className={'overflow-x-scroll scrollbar-none'}>{expectedOutWithSlippage}</b>
					</div>
					<p
						suppressHydrationWarning
						className={'pl-2 text-xs font-normal text-neutral-600'}>
						{formatCounterValue(
							expectedOutWithSlippage,
							toAddress(selectedOptionTo.value) === YCRV_TOKEN_ADDRESS
								? ycrvPrice || 0
								: toAddress(selectedOptionFrom.value) === YCRV_CURVE_POOL_ADDRESS
								? ycrvCurvePoolPrice || 0
								: Number(
										getToken({address: selectedOptionTo.value, chainID: selectedOptionTo.chainID})
											.price.normalized
								  ) ||
								  vaults?.[toAddress(selectedOptionTo.value)]?.tvl?.price ||
								  0
						)}
					</p>
				</div>
			</div>

			<div aria-label={'card actions'}>
				<div className={'mb-3'}>{renderButton()}</div>
			</div>
		</>
	);
}

export function WithCardTransactor({className}: {className: string}): ReactElement {
	return (
		<CardTransactorContextApp
			defaultOptionFrom={ZAP_OPTIONS_FROM[0]}
			defaultOptionTo={ZAP_OPTIONS_TO[0]}>
			<div className={cl('mx-auto w-full bg-neutral-200 p-4 md:p-6', className)}>
				<div className={'flex flex-col pb-2'}>
					<h2 className={'text-2xl font-bold'}>{'Supercharge your yield with yCRV'}</h2>
				</div>
				<div className={'w-full pb-8'}>
					<p className={'text-sm text-neutral-600'}>
						{
							'Swap any token within the yCRV ecosystem for any other. Maybe you want to swap for a higher yield, or maybe you just like swapping. It’s ok, we don’t judge.'
						}
					</p>
				</div>
				<CardZap />
			</div>
		</CardTransactorContextApp>
	);
}
