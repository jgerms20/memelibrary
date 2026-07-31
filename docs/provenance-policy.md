# Source-verification policy

Meme Library separates a playable file from the source item it represents. A convenient repost, GIF, sound reuse, edit, or parody must never be presented as the original.

## Statuses

- **Confirmed original**: the record links to the primary source item and has at least one independent, credible corroborating source. For video, compare the primary page's title, uploader/channel metadata, publication date, and—when it is available—the transcript or spoken quote to the catalog record. Store the evidence links and a short, factual note.
- **Derivative or reuse**: the media is a repost, edit, parody, clip, reaction, or sound reuse. Keep it out of original-intent search results. It may be retained only as an explicitly labelled alternate after the confirmed original exists.
- **Origin not yet confirmed**: a discovery source has not supplied enough evidence to establish the original. It remains searchable for recall, but the interface must not call it an original source.

## Refresh rule

New automated catalog records begin as **Origin not yet confirmed**. A refresh must not upgrade a record based solely on a title, filename, or sound match. To promote it, add a primary `sourceUrl`, a `provenanceEvidence` array containing the source pages consulted, and a factual `provenanceNote`. If the candidate is a reuse, mark it `derivative-reuse` so original-intent search omits it.

## Media rule

`mediaType` describes the media the user will see, not an adjacent thumbnail: `video` is playable motion, `gif` is animated media, and `image` is a still. A video thumbnail is labelled as a preview until playback begins. The primary media action must use the confirmed original source URL; any alternate playback copy needs a derivative/reuse label.
