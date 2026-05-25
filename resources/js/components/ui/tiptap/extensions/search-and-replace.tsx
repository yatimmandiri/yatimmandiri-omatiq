import { type Editor as CoreEditor, Extension, type Range } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/** Extend Tiptap Commands */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      setReplaceTerm: (replaceTerm: string) => ReturnType;
      replace: () => ReturnType;
      replaceAll: () => ReturnType;
      selectNextResult: () => ReturnType;
      selectPreviousResult: () => ReturnType;
      setCaseSensitive: (caseSensitive: boolean) => ReturnType;
    };
  }
}

/** Storage interface for searchAndReplace */
export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: Range[];
  lastSearchTerm: string;
  selectedResult: number;
  lastSelectedResult: number;
  caseSensitive: boolean;
  lastCaseSensitiveState: boolean;
}

/** Extension options */
export interface SearchAndReplaceOptions {
  searchResultClass: string;
  selectedResultClass: string;
  disableRegex: boolean;
}

/** Typed editor with searchAndReplace storage */
interface EditorWithSearchAndReplace extends CoreEditor {
  storage: CoreEditor['storage'] & {
    searchAndReplace: SearchAndReplaceStorage;
  };
}

const getSearchStorage = (editor: CoreEditor): SearchAndReplaceStorage =>
  (editor as EditorWithSearchAndReplace).storage.searchAndReplace;

/** Build regex */
const getRegex = (
  searchString: string,
  disableRegex: boolean,
  caseSensitive: boolean
): RegExp => {
  const escapedString = disableRegex
    ? searchString.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    : searchString;
  return new RegExp(escapedString, caseSensitive ? "gu" : "gui");
};

/** Process search results */
interface TextNodeWithPosition {
  text: string;
  pos: number;
}

interface ProcessedSearches {
  decorationsToReturn: DecorationSet;
  results: Range[];
}

function processSearches(
  doc: PMNode,
  searchTerm: RegExp,
  selectedResultIndex: number,
  searchResultClass: string,
  selectedResultClass: string
): ProcessedSearches {
  const decorations: Decoration[] = [];
  const results: Range[] = [];
  const textNodesWithPosition: TextNodeWithPosition[] = [];

  if (!searchTerm) return { decorationsToReturn: DecorationSet.empty, results: [] };

  doc.descendants((node, pos) => {
    if (node.isText) textNodesWithPosition.push({ text: node.text || "", pos });
  });

  for (const { text, pos } of textNodesWithPosition) {
    const matches = Array.from(text.matchAll(searchTerm)).filter(([matchText]) => matchText.trim());
    for (const match of matches) {
      if (match.index !== undefined) {
        results.push({ from: pos + match.index, to: pos + match.index + match[0].length });
      }
    }
  }

  for (let i = 0; i < results.length; i++) {
    const { from, to } = results[i];
    decorations.push(
      Decoration.inline(from, to, {
        class: selectedResultIndex === i ? selectedResultClass : searchResultClass,
      })
    );
  }

  return { decorationsToReturn: DecorationSet.create(doc, decorations), results };
}

/** Replace first result */
const replace = (replaceTerm: string, results: Range[], { state, dispatch }: any) => {
  const firstResult = results[0];
  if (!firstResult) return;
  dispatch?.(state.tr.insertText(replaceTerm, firstResult.from, firstResult.to));
};

/** Rebase next result after replacement */
const rebaseNextResult = (
  replaceTerm: string,
  index: number,
  lastOffset: number,
  results: Range[]
): [number, Range[]] | null => {
  const nextIndex = index + 1;
  if (!results[nextIndex]) return null;
  const currentResult = results[index];
  if (!currentResult) return null;
  const offset = currentResult.to - currentResult.from - replaceTerm.length + lastOffset;
  const { from, to } = results[nextIndex];
  results[nextIndex] = { from: from - offset, to: to - offset };
  return [offset, results];
};

/** Replace all results */
const replaceAll = (
  replaceTerm: string,
  results: Range[],
  { tr, dispatch }: { tr: any; dispatch: any }
) => {
  if (!results.length) return;
  let offset = 0;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!result) continue;
    tr.insertText(replaceTerm, result.from, result.to);
    const rebaseResponse = rebaseNextResult(replaceTerm, i, offset, results);
    if (rebaseResponse) offset = rebaseResponse[0];
  }
  dispatch(tr);
};

/** Navigate search results safely */
const scrollResultIntoView = (view: CoreEditor['view'], from: number) => {
  if (!view) return;
  const dom = view.domAtPos(from).node;
  if (dom instanceof Element) {
    dom.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const selectNext = (editor: CoreEditor) => {
  const storage = getSearchStorage(editor);
  if (!storage.results.length) return;
  storage.selectedResult = storage.selectedResult >= storage.results.length - 1 ? 0 : storage.selectedResult + 1;
  scrollResultIntoView(editor.view, storage.results[storage.selectedResult].from);
};

const selectPrevious = (editor: CoreEditor) => {
  const storage = getSearchStorage(editor);
  if (!storage.results.length) return;
  storage.selectedResult = storage.selectedResult <= 0 ? storage.results.length - 1 : storage.selectedResult - 1;
  scrollResultIntoView(editor.view, storage.results[storage.selectedResult].from);
};

/** Plugin key */
export const searchAndReplacePluginKey = new PluginKey("searchAndReplacePlugin");

/** Extension definition */
export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: "searchAndReplace",

  addOptions() {
    return {
      searchResultClass: "bg-yellow-200",
      selectedResultClass: "bg-yellow-500",
      disableRegex: true,
    };
  },

  addStorage() {
    return {
      searchTerm: "",
      replaceTerm: "",
      results: [],
      lastSearchTerm: "",
      selectedResult: 0,
      lastSelectedResult: 0,
      caseSensitive: false,
      lastCaseSensitiveState: false,
    };
  },

  addCommands() {
    return {
      setSearchTerm: (searchTerm: string) => ({ editor }) => {
        getSearchStorage(editor).searchTerm = searchTerm;
        return false;
      },
      setReplaceTerm: (replaceTerm: string) => ({ editor }) => {
        getSearchStorage(editor).replaceTerm = replaceTerm;
        return false;
      },
      replace: () => ({ editor, state, dispatch }) => {
        const { replaceTerm, results } = getSearchStorage(editor);
        replace(replaceTerm, results, { state, dispatch });
        return false;
      },
      replaceAll: () => ({ editor, tr, dispatch }) => {
        const { replaceTerm, results } = getSearchStorage(editor);
        replaceAll(replaceTerm, results, { tr, dispatch });
        return false;
      },
      selectNextResult: () => ({ editor }) => {
        selectNext(editor);
        return false;
      },
      selectPreviousResult: () => ({ editor }) => {
        selectPrevious(editor);
        return false;
      },
      setCaseSensitive: (caseSensitive: boolean) => ({ editor }) => {
        getSearchStorage(editor).caseSensitive = caseSensitive;
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const { searchResultClass, selectedResultClass, disableRegex } = this.options;

    const setLastSearchTerm = (t: string) => { getSearchStorage(editor).lastSearchTerm = t; };
    const setLastSelectedResult = (r: number) => { getSearchStorage(editor).lastSelectedResult = r; };
    const setLastCaseSensitiveState = (s: boolean) => { getSearchStorage(editor).lastCaseSensitiveState = s; };

    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply({ doc, docChanged }, oldState) {
            const storage = getSearchStorage(editor);

            if (
              !docChanged &&
              storage.lastSearchTerm === storage.searchTerm &&
              storage.selectedResult === storage.lastSelectedResult &&
              storage.lastCaseSensitiveState === storage.caseSensitive
            ) return oldState;

            setLastSearchTerm(storage.searchTerm);
            setLastSelectedResult(storage.selectedResult);
            setLastCaseSensitiveState(storage.caseSensitive);

            if (!storage.searchTerm) {
              storage.selectedResult = 0;
              storage.results = [];
              return DecorationSet.empty;
            }

            const { decorationsToReturn, results } = processSearches(
              doc,
              getRegex(storage.searchTerm, disableRegex, storage.caseSensitive),
              storage.selectedResult,
              searchResultClass,
              selectedResultClass
            );

            storage.results = results;

            if (storage.selectedResult > results.length) {
              storage.selectedResult = 1;
              editor.commands.selectPreviousResult();
            }

            return decorationsToReturn;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export default SearchAndReplace;
