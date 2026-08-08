module UI
  ( run
  ) where

import           Brick                  (App (..), AttrName, BrickEvent (..),
                                         EventM, Location (..),
                                         Padding (..), Widget, attrMap,
                                         attrName, defaultMain,
                                         emptyWidget, fg, halt, padAll,
                                         padBottom, showCursor, showFirstCursor,
                                         str, withAttr, (<+>), (<=>))
import           Brick.Widgets.Center   (center)
import           Control.Monad.IO.Class (liftIO)
import           Control.Monad.State    (get, modify, put)
import           Data.Char              (isSpace)
import           Data.Maybe             (fromMaybe)
import           Data.Time              (getCurrentTime)
import           Data.Word              (Word8)
import           Graphics.Vty           (Attr, Color (..), Event (..), Key (..),
                                         Modifier (..), bold, defAttr,
                                         withStyle)
import           Text.Printf            (printf)

import           GottaGoFast

emptyAttrName :: AttrName
emptyAttrName = attrName "empty"

errorAttrName :: AttrName
errorAttrName = attrName "error"

resultAttrName :: AttrName
resultAttrName = attrName "result"

drawCharacter :: Character -> Widget ()
drawCharacter (Hit c)    = str [c]
drawCharacter (Miss ' ') = withAttr errorAttrName $ str ['_']
drawCharacter (Miss c)   = withAttr errorAttrName $ str [c]
drawCharacter (Empty c)  = withAttr emptyAttrName $ str [c]

drawLine :: Line -> Widget ()
-- We display an empty line as a single space so that it still occupies
-- vertical space.
drawLine [] = str " "
drawLine ls = foldl1 (<+>) $ map drawCharacter ls

drawText :: State -> Widget ()
drawText s = padBottom (Pad 2) . foldl (<=>) emptyWidget . map drawLine $ page s

drawResults :: State -> Widget ()
drawResults s =
  withAttr resultAttrName . str $
  printf "%.f words per minute • %.f%% accuracy" (wpm s) (accuracy s * 100)

draw :: State -> [Widget ()]
draw s
  | hasEnded s = pure . center . padAll 1 $ drawText s <=> drawResults s
  | otherwise =
    pure . center . padAll 1 . showCursor () (Location $ cursor s) $
    drawText s <=> str " "

handleChar :: Char -> EventM () State ()
handleChar c = do
  s <- get
  let s' = applyChar c s
  if not $ hasStarted s then do
    now <- liftIO getCurrentTime
    put $ startClock now s'
  else if isComplete s' then do
    now <- liftIO getCurrentTime
    put $ stopClock now s'
  else
    put s'

handleEvent :: BrickEvent () e -> EventM () State ()
handleEvent (VtyEvent (EvKey key [MCtrl])) =
  case key of
    KChar 'c' -> halt
    KChar 'd' -> halt
    KChar 'w' -> modify applyBackspaceWord
    KBS       -> modify applyBackspaceWord
    _         -> pure ()
handleEvent (VtyEvent (EvKey key [MAlt])) =
  case key of
    KBS -> modify applyBackspaceWord
    _   -> pure ()
handleEvent (VtyEvent (EvKey key [MMeta])) =
  case key of
    KBS -> modify applyBackspaceWord
    _   -> pure ()
handleEvent (VtyEvent (EvKey key [])) = do
  s <- get
  if hasEnded s then
    case key of
      KEnter -> halt
      KEsc   -> modify (\st -> st { loop = True }) >> halt
      _      -> pure ()
  else
    case key of
      KChar c -> handleChar c
      KEnter  -> handleChar '\n'
      KBS     -> modify applyBackspace
      KEsc    -> modify (\st -> st { loop = True }) >> halt
      _       -> pure ()
handleEvent _ = pure ()

app :: Attr -> Attr -> Attr -> App State e ()
app emptyAttr errorAttr resultAttr =
  App
    { appDraw = draw
    , appChooseCursor = showFirstCursor
    , appHandleEvent = handleEvent
    , appStartEvent = pure ()
    , appAttrMap =
        const $
        attrMap
          defAttr
          [ (emptyAttrName, emptyAttr)
          , (errorAttrName, errorAttr)
          , (resultAttrName, resultAttr)
          ]
    }

run :: Word8 -> Word8 -> String -> IO Bool
run fgEmptyCode fgErrorCode t = do
  s <- defaultMain (app emptyAttr errorAttr resultAttr) $ initialState t
  return $ loop s
  where
    emptyAttr = fg . ISOColor $ fgEmptyCode
    errorAttr = flip withStyle bold . fg . ISOColor $ fgErrorCode
    -- abusing the fgErrorCode to use as a highlight colour for the results here
    resultAttr = fg . ISOColor $ fgErrorCode
