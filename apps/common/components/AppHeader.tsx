import {cloneElement, Fragment, useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {AnimatePresence} from 'framer-motion';
import {Popover, Transition} from '@headlessui/react';
import {useIsMounted} from '@react-hookz/web';
import {VaultsHeader} from '@vaults/components/header/VaultsHeader';
import {VeYfiHeader} from '@veYFI/components/header/VeYfiHeader';
import {Header} from '@yearn-finance/web-lib/components/Header';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {BalanceReminderPopover} from '@common/components/BalanceReminderPopover';
import {ImageWithFallback} from '@common/components/ImageWithFallback';
import {useMenu} from '@common/contexts/useMenu';
import {LogoYearn} from '@common/icons/LogoYearn';
import {YBalHeader} from '@yBal/components/header/YBalHeader';
import {YBribeHeader} from '@yBribe/components/header/YBribeHeader';
import {YCrvHeader} from '@yCRV/components/header/YCrvHeader';

import {AppName, APPS} from './Apps';
import {MotionDiv} from './MotionDiv';

import type {ReactElement} from 'react';
import type {TMenu} from '@yearn-finance/web-lib/components/Header';

function Logo(): ReactElement {
	const {pathname} = useRouter();

	return (
		<>
			<YCrvHeader pathname={pathname} />
			<YBalHeader pathname={pathname} />
			<VaultsHeader pathname={pathname} />
			<VeYfiHeader pathname={pathname} />
			<YBribeHeader pathname={pathname} />
			<MotionDiv
				name={'yearn'}
				animate={pathname === '/' ? 'enter' : 'exit'}>
				<LogoYearn
					className={'h-8 w-8'}
					back={'text-neutral-900'}
					front={'text-neutral-0'}
				/>
			</MotionDiv>
		</>
	);
}

function LogoPopover(): ReactElement {
	const [isShowing, set_isShowing] = useState(false);

	const YETH = {
		name: 'yETH',
		href: 'https://yeth.yearn.fi',
		isDisabled: false,
		icon: (
			<ImageWithFallback
				alt={'yETH'}
				className={'h-8 w-8'}
				width={100}
				height={100}
				src={`${process.env.BASE_YEARN_ASSETS_URI}/1/0x1BED97CBC3c24A4fb5C069C6E311a967386131f7/logo-128.png`}
				loading={'eager'}
				priority
			/>
		)
	};

	return (
		<Popover
			onMouseEnter={(): void => set_isShowing(true)}
			onMouseLeave={(): void => set_isShowing(false)}
			className={'relative'}>
			<Popover.Button className={'flex items-center'}>
				<Link href={'/'}>
					<span className={'sr-only'}>{'Back to home'}</span>
					<Logo />
				</Link>
			</Popover.Button>
			<Transition
				as={Fragment}
				show={isShowing}
				enter={'transition ease-out duration-200'}
				enterFrom={'opacity-0 translate-y-1'}
				enterTo={'opacity-100 translate-y-0'}
				leave={'transition ease-in duration-150'}
				leaveFrom={'opacity-100 translate-y-0'}
				leaveTo={'opacity-0 translate-y-1'}>
				<Popover.Panel
					className={'absolute left-1/2 z-10 mt-6 w-80 -translate-x-1/2 px-4 pt-4 sm:px-0 md:w-96'}>
					<div className={'overflow-hidden border border-neutral-200 shadow-lg'}>
						<div className={'relative grid grid-cols-2 bg-neutral-0 md:grid-cols-3'}>
							{[...Object.values(APPS), YETH]
								.filter(({isDisabled}): boolean => !isDisabled)
								.map(({name, href, icon}): ReactElement => {
									return (
										<Link
											prefetch={false}
											key={name}
											href={href}
											onClick={(): void => set_isShowing(false)}>
											<div
												onClick={(): void => set_isShowing(false)}
												className={
													'flex cursor-pointer flex-col items-center p-4 transition-colors hover:bg-neutral-200'
												}>
												<div>{cloneElement(icon)}</div>
												<div className={'pt-2 text-center'}>
													<b className={'text-base'}>{name}</b>
												</div>
											</div>
										</Link>
									);
								})}
						</div>
					</div>
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}

export function AppHeader(): ReactElement {
	const isMounted = useIsMounted();
	const {pathname} = useRouter();
	const {isActive} = useWeb3();
	const {onOpenMenu} = useMenu();
	const menu = useMemo((): TMenu[] => {
		const HOME_MENU = {path: '/', label: 'Home'};

		if (pathname.startsWith('/ycrv')) {
			return [HOME_MENU, ...APPS[AppName.YCRV].menu];
		}

		if (pathname.startsWith('/ybal')) {
			return [HOME_MENU, ...APPS[AppName.YBAL].menu];
		}

		if (pathname.startsWith('/vaults')) {
			return [HOME_MENU, ...APPS[AppName.VAULTS].menu];
		}

		if (pathname.startsWith('/veyfi')) {
			return [HOME_MENU, ...APPS[AppName.VEYFI].menu];
		}

		if (pathname.startsWith('/ybribe')) {
			return [HOME_MENU, ...APPS[AppName.YBRIBE].menu];
		}
		return [
			HOME_MENU,
			{
				path: 'https://gov.yearn.fi/',
				label: 'Governance',
				target: '_blank'
			},
			{path: 'https://blog.yearn.fi/', label: 'Blog', target: '_blank'},
			{path: 'https://docs.yearn.fi/', label: 'Docs', target: '_blank'}
		];
	}, [pathname]);

	const supportedNetworks = useMemo((): number[] => {
		const ethereumOnlyPaths = ['/ycrv', '/ybal', '/veyfi', '/ybribe'];
		if (ethereumOnlyPaths.some((path): boolean => pathname.startsWith(path))) {
			return [1];
		}

		return [1, 10, 250, 42161];
	}, [pathname]);

	return (
		<Header
			showNetworkSelector={false}
			linkComponent={<Link href={''} />}
			currentPathName={pathname}
			onOpenMenuMobile={onOpenMenu}
			nav={menu}
			supportedNetworks={supportedNetworks}
			logo={
				<AnimatePresence mode={'wait'}>
					<LogoPopover />
				</AnimatePresence>
			}
			extra={
				<Renderable shouldRender={isActive && isMounted()}>
					<div className={'ml-4'}>
						<BalanceReminderPopover />
					</div>
				</Renderable>
			}
		/>
	);
}
