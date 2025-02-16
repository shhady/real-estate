import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaTextHeight,
} from 'react-icons/fa';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (e, format) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    editor.focus();
  };

  const formatElement = (e, format) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    editor.focus();
  };

  const handleFontSize = (e) => {
    e.preventDefault();
    const size = e.target.value;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if (node.setStyle) {
            node.setStyle(`font-size: ${size}px`);
          }
        });
      }
    });
    editor.focus();
  };

  const buttonClass = "p-2 hover:bg-gray-200 rounded text-gray-900 flex items-center justify-center";
  const dropdownClass = "p-2 hover:bg-gray-200 text-gray-900";

  return (
    <div className="toolbar border-b border-gray-300 p-2 flex gap-2 bg-gray-50 text-gray-900">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(UNDO_COMMAND);
          editor.focus();
        }}
        className={buttonClass}
        title="בטל"
      >
        <FaUndo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(REDO_COMMAND);
          editor.focus();
        }}
        className={buttonClass}
        title="בצע שוב"
      >
        <FaRedo className="w-4 h-4" />
      </button>
      <div className="border-r border-gray-300 mx-2" />
      
      {/* Font Size Dropdown */}
      <select
        className={dropdownClass}
        onChange={handleFontSize}
        onClick={(e) => e.stopPropagation()}
        title="גודל טקסט"
      >
        <option value="">גודל טקסט</option>
        <option value="12">קטן</option>
        <option value="16">רגיל</option>
        <option value="20">גדול</option>
        <option value="24">גדול מאוד</option>
      </select>

      <div className="border-r border-gray-300 mx-2" />
      <button
        type="button"
        onClick={(e) => formatText(e, 'bold')}
        className={buttonClass}
        title="מודגש"
      >
        <FaBold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => formatText(e, 'italic')}
        className={buttonClass}
        title="נטוי"
      >
        <FaItalic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => formatText(e, 'underline')}
        className={buttonClass}
        title="קו תחתון"
      >
        <FaUnderline className="w-4 h-4" />
      </button>
      <div className="border-r border-gray-300 mx-2" />
      <button
        type="button"
        onClick={(e) => formatElement(e, 'ul')}
        className={buttonClass}
        title="רשימה"
      >
        <FaListUl className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => formatElement(e, 'ol')}
        className={buttonClass}
        title="רשימה ממוספרת"
      >
        <FaListOl className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => formatElement(e, 'quote')}
        className={buttonClass}
        title="ציטוט"
      >
        <FaQuoteRight className="w-4 h-4" />
      </button>
    </div>
  );
} 