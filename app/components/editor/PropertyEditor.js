import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ToolbarPlugin } from './ToolbarPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { DirectionPlugin } from './DirectionPlugin';

const theme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-2 text-gray-900',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    ol: 'list-decimal list-inside rtl',
    ul: 'list-disc list-inside rtl',
  },
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

const PropertyEditor = ({ onChange, initialValue }) => {
  const initialConfig = {
    namespace: 'PropertyEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListItemNode,
      ListNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
    editable: true,
    direction: 'rtl',
  };

  const handleChange = (editorState) => {
    if (onChange) {
      editorState.read(() => {
        const json = JSON.stringify(editorState.toJSON());
        onChange(json);
      });
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border border-gray-300 rounded-lg overflow-hidden" dir="rtl">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="editor-input min-h-[200px] p-4 focus:outline-none text-gray-900" 
                dir="rtl"
              />
            }
            placeholder={
              <div className="editor-placeholder absolute top-0 right-0 p-4 text-gray-400">
                תיאור הנכס...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <DirectionPlugin defaultDirection="rtl" initialValue={initialValue} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default PropertyEditor; 