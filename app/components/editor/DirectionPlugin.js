import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode, COMMAND_PRIORITY_EDITOR } from 'lexical';

export function DirectionPlugin({ defaultDirection = 'rtl', initialValue }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialValue) {
      editor.update(() => {
        const root = $getRoot();
        
        try {
          if (typeof initialValue === 'string') {
            try {
              // Try to parse as JSON first
              const parsedState = JSON.parse(initialValue);
              editor.setEditorState(editor.parseEditorState(parsedState));
            } catch {
              // If not JSON, create a simple text node
              const paragraph = $createParagraphNode();
              const text = $createTextNode(initialValue);
              text.setDirection(defaultDirection);
              paragraph.append(text);
              root.clear();
              root.append(paragraph);
            }
          } else if (initialValue && typeof initialValue === 'object') {
            // If it's already an object, parse it as editor state
            editor.setEditorState(editor.parseEditorState(initialValue));
          }
        } catch (error) {
          console.error('Error setting initial editor state:', error);
          // Create an empty paragraph as fallback
          const paragraph = $createParagraphNode();
          paragraph.setDirection(defaultDirection);
          root.clear();
          root.append(paragraph);
        }
      });
    }

    // Register command listener to maintain focus
    return editor.registerCommand(
      'maintain-focus',
      () => {
        editor.focus();
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, initialValue, defaultDirection]);

  // Set direction for new text
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        children.forEach(node => {
          if (!node.getDirection()) {
            node.setDirection(defaultDirection);
          }
          // Also set direction for child nodes
          if (node.getChildren) {
            node.getChildren().forEach(child => {
              if (!child.getDirection()) {
                child.setDirection(defaultDirection);
              }
            });
          }
        });
      });
    });
  }, [editor, defaultDirection]);

  return null;
} 