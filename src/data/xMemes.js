import xMedia from './xMedia.generated.json';
import { X_POSTS } from './xPosts.js';

const xThumbnail = 'https://abs.twimg.com/responsive-web/client-web/icon-default.522d363a.png';

function xReaction({ id: postId, sourceUrl, account, date, title, summary, tags, emotions, community, peak = 'Archive circulation', trendScore = 82 }) {
  const media = xMedia[postId] ?? {};
  const year = date.match(/\d{4}/)?.[0] ?? '2026';
  return {
    id: `x-${postId}`,
    title,
    mediaType: 'video',
    mediaUrl: xThumbnail,
    directVideoUrl: media.videoUrl,
    posterUrl: media.posterUrl,
    verifiedAt: media.verifiedAt,
    embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${postId}&dnt=true`,
    sourceUrl,
    downloadUrl: sourceUrl,
    platform: 'X',
    originPlatform: 'X',
    community,
    creator: `@${account}`,
    creatorUrl: `https://x.com/${account}`,
    firstUpload: date,
    firstUploadUrl: sourceUrl,
    capturedIn: `Reaction archive post by @${account}`,
    indexedAt: 'July 19, 2026',
    peak,
    trendScore,
    nowStatus: 'Still circulating through public reaction archives and linked here to its verified X post.',
    aliases: [title.toLowerCase(), ...tags.slice(0, 3)],
    quotes: tags.filter((tag) => tag.split(' ').length > 2),
    visual: [summary],
    emotions,
    contexts: tags,
    tags: [...tags, 'reaction video', 'X'],
    microtags: [...tags, community],
    summary,
    why: `Matches descriptions involving ${tags.slice(0, 4).join(', ')} and the ${emotions.slice(0, 2).join(' / ')} reaction.` ,
    origin: `A verified public reaction-archive post on X by @${account}. The archive account may not be the original media creator.`,
    location: 'X',
    sourceKind: 'Verified X archive post',
    sourceAction: 'Open post on X',
    mediaLabel: 'X REACTION POST',
    useCases: tags.slice(0, 3),
    lifecycle: [4, 10, 28, 58, 100, 88, 72, 66, 58, 54, 50, 48],
    timelineLabels: { start: year, peak, now: '2026' },
    nsfw: false,
    spoiler: false,
    trail: [
      { label: 'Archive post', date, detail: `@${account} on X`, tone: 'yellow' },
      { label: 'Tagged', date: '2026', detail: community, tone: 'purple' },
      { label: 'Indexed', date: '2026', detail: 'Added to Meme Library', tone: 'blue' },
      { label: 'Available', date: 'Now', detail: 'Linked to the public post', tone: 'coral' },
    ],
  };
}

export const xMemes = X_POSTS.map(xReaction);
