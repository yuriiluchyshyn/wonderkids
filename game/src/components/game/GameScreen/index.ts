/**
 * The game shell — one level of a game, from its intro to its win screen.
 * `GameScreen.tsx` puts it together; each of its parts keeps one concern:
 *
 *   GameHeader      home, name, purse, the race track and its task segments
 *   IntroCard       what the game shows before play
 *   HeldBoard       the board held still while a help is said (a tap is caught)
 *   BoardDock       the fact and the help, kept in sight at the bottom
 *     OutroLine       the fact after a right answer, read part by part
 *     HelpArea        the help, with the hint voice's switch and the way back up
 *   WinSummary      the win screen
 *
 *   useTaskIntro      the intro, as shown and as said
 *   useTaskVoice      the intro and each task read out
 *   useScreenRest     screen time, and the rest after it
 *   useCompanionPace  where the companion stands, and idle drift
 *   useIdleExplain    a task that explains itself after a long silence
 *   useHelpFlow       help when it is due: a script on the stage, or the module's how-to
 *   useHelpAttention  bringing the help into sight; the nudge after a held tap
 *   useOutro          the fact after a right answer, and the wait for it
 *   useLevelEnd       the end of a level: crunch, chest, jingle, the win read out
 *   useTaskCallbacks  what a board reports back
 */
export { GameScreen } from './GameScreen';
