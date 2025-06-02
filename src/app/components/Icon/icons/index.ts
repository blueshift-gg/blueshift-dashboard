import { AnchorIcon } from "./Anchor";
import { ArrowLeftIcon } from "./ArrowLeft";
import { ArrowRightIcon } from "./ArrowRight";
import { AssemblyIcon } from "./Assembly";
import { ChallengeIcon } from "./Challenge";
import { ChevronIcon } from "./Chevron";
import { ClaimIcon } from "./Claim";
import { ClaimedIcon } from "./Claimed";
import { CopyIcon } from "./Copy";
import { DiscordIcon } from "./Discord";
import { FilterIcon } from "./Filter";
import { FlagIcon } from "./Flag";
import { FlameIcon } from "./Flame";
import { GithubIcon } from "./Github";
import { GridViewIcon } from "./GridView";
import { LessonsIcon } from "./Lessons";
import { LinkIcon } from "./Link";
import { ListViewIcon } from "./ListView";
import { LockedIcon } from "./Locked";
import { PlayIcon } from "./Play";
import { ProgressIcon } from "./Progress";
import { RewardsIcon } from "./Rewards";
import { RefreshIcon } from "./Refresh";
import { RustIcon } from "./Rust";
import { SearchIcon } from "./Search";
import { ShiftArrowIcon } from "./ShiftArrow";
import { SuccessIcon } from "./Success";
import { SuccessCircleIcon } from "./SuccessCircle";
import { TableIcon } from "./Table";
import { TargetIcon } from "./Target";
import { TypescriptIcon } from "./Typescript";
import { UnclaimedIcon } from "./Unclaimed";
import { UploadIcon } from "./Upload";
import { WalletIcon } from "./Wallet";
import { WarningIcon } from "./Warning";
import { XIcon } from "./X";
import { GlobeIcon } from "./Globe";
import { MinimizeIcon } from "./Minimize";
import { ExpandIcon } from "./Expand";

export const IconComponents = {
  Anchor: AnchorIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  Assembly: AssemblyIcon,
  Challenge: ChallengeIcon,
  Chevron: ChevronIcon,
  Claim: ClaimIcon,
  Claimed: ClaimedIcon,
  Copy: CopyIcon,
  Discord: DiscordIcon,
  Filter: FilterIcon,
  Flag: FlagIcon,
  Flame: FlameIcon,
  Github: GithubIcon,
  Globe: GlobeIcon,
  GridView: GridViewIcon,
  Lessons: LessonsIcon,
  Link: LinkIcon,
  ListView: ListViewIcon,
  Locked: LockedIcon,
  Play: PlayIcon,
  Progress: ProgressIcon,
  Rewards: RewardsIcon,
  Refresh: RefreshIcon,
  Research: ShiftArrowIcon,
  Rust: RustIcon,
  Search: SearchIcon,
  ShiftArrow: ShiftArrowIcon,
  Success: SuccessIcon,
  SuccessCircle: SuccessCircleIcon,
  Table: TableIcon,
  Target: TargetIcon,
  Typescript: TypescriptIcon,
  Unlocked: UnclaimedIcon,
  Upload: UploadIcon,
  Wallet: WalletIcon,
  Warning: WarningIcon,
  X: XIcon,
  Minimize: MinimizeIcon,
  Expand: ExpandIcon,
} as const;

export type IconName = keyof typeof IconComponents;
