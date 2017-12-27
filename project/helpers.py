import warnings
import os

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def youtubesearch(options, key):

    warnings.simplefilter("ignore", DeprecationWarning)
    youtube = build('youtube', 'v3', developerKey=key)

    search_response = youtube.search().list(
        q=options['q'],
        type='video',
        location=options['location'],
        locationRadius=options['locationRadius'],
        part='id,snippet',
        maxResults=options['maxResults']
    ).execute()

    search_videos = []

    # Merge video ids

    for search_result in search_response.get('items', []):
        search_videos.append(search_result['id']['videoId'])

    video_ids = ','.join(search_videos)

    # Call the videos.list method to retrieve location details for each video.

    video_response = youtube.videos().list(
        id=video_ids,
        part='snippet, recordingDetails'
    ).execute()

    videos = []

    return  video_response