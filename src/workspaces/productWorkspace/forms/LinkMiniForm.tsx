import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Transforms, Range } from 'slate';
import { useSlateStatic } from 'slate-react';
import { LinkElement } from '../types/custom-types';

type LinkFormInputs = {
  text: string;
  url: string;
};

interface LinkMiniFormProps {
  initialUrl?: string;
  initialText?: string;
  onClose: () => void;
}

const LinkMiniForm: React.FC<LinkMiniFormProps> = ({
  initialUrl = '',
  initialText = '',
  onClose,
}) => {
  const editor = useSlateStatic();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LinkFormInputs>({
    defaultValues: {
      text: initialText,
      url: initialUrl,
    },
  });

  useEffect(() => {
    setFocus('text');
  }, [setFocus]);

  const onSubmit: SubmitHandler<LinkFormInputs> = ({ text, url }) => {
    if (!url) return;

    const link: LinkElement = {
      type: 'link',
      url,
      children: [{ text }],
    };

    if (editor.selection && Range.isCollapsed(editor.selection)) {
      Transforms.insertNodes(editor, link);
      onClose();
      return;
    }

    if (editor.selection) {
      Transforms.delete(editor);
      Transforms.insertNodes(editor, link);
      Transforms.move(editor);
      onClose();
      return;
    }

    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });

    onClose();
  };

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[45vw] min-w-[600px] pointer-events-auto z-1000">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md p-3 rounded-md space-y-3 border border-gray-200 font-opensans font-[400] text-[12px] text-[#181818]"
      >
        <input
          type="text"
          placeholder="Enter text"
          {...register('text', { required: true })}
          className="mt-1 block w-full rounded border border-gray-300 p-1"
        />
        {errors.text && (
          <span className="text-xs text-red-500">This field is required</span>
        )}

        <input
          type="url"
          placeholder="Enter URL"
          {...register('url', {
            required: true,
            pattern: {
              value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
              message: 'Enter a valid URL',
            },
          })}
          className="mt-1 block w-full rounded border border-gray-300 p-1"
        />
        {errors.url && (
          <span className="text-xs text-red-500">
            {errors.url.message || 'URL is required'}
          </span>
        )}

        <div className="flex justify-end space-x-2 text-[12px]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkMiniForm;
