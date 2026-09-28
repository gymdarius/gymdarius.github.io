(function () {
  'use strict';

  const owner = 'gymdarius';
  const repo = 'gymdarius.github.io';
  const branch = 'master';
  const draftKey = 'david-blog-writer-draft-v1';

  const form = document.getElementById('writer-form');
  if (!form) return;

  const title = document.getElementById('post-title');
  const subtitle = document.getElementById('post-subtitle');
  const topic = document.getElementById('post-topic');
  const newTopic = document.getElementById('new-topic');
  const newTopicRow = document.getElementById('new-topic-row');
  const slug = document.getElementById('post-slug');
  const body = document.getElementById('post-body');
  const token = document.getElementById('github-token');
  const pathPreview = document.getElementById('post-path');
  const filePreview = document.getElementById('post-preview');
  const status = document.getElementById('writer-status');
  const publishButton = document.getElementById('publish-button');
  const clearButton = document.getElementById('clear-button');
  let draftId = makeDraftId();

  function makeDraftId() {
    const parts = dateParts(new Date());
    return 'post-' + parts.day.replace(/-/g, '') + '-' + parts.time.replace(/:/g, '');
  }

  function dateParts(now) {
    const values = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now).forEach(function (part) { values[part.type] = part.value; });
    const day = values.year + '-' + values.month + '-' + values.day;
    const time = values.hour + ':' + values.minute + ':' + values.second;
    return { day: day, time: time, date: day + ' ' + time + ' +0800' };
  }

  function chosenTopic() {
    return (topic.value === '__new__' ? newTopic.value : topic.value).trim();
  }

  function chosenSlug() {
    return slug.value.trim() || draftId;
  }

  function filePath(now) {
    return '_posts/' + dateParts(now).day + '-' + chosenSlug() + '.md';
  }

  function markdown(now) {
    const lines = [
      '---',
      'layout: post',
      'title: ' + JSON.stringify(title.value.trim()),
      'date: ' + JSON.stringify(dateParts(now).date),
      'author: ' + JSON.stringify('David'),
      'header-img: ' + JSON.stringify('img/home-bg.jpg'),
      'catalog: true',
      'tags:',
      '  - ' + JSON.stringify(chosenTopic())
    ];
    if (subtitle.value.trim()) lines.splice(3, 0, 'subtitle: ' + JSON.stringify(subtitle.value.trim()));
    return lines.join('\n') + '\n---\n\n' + body.value.trim() + '\n';
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        title: title.value, subtitle: subtitle.value, topic: topic.value,
        newTopic: newTopic.value, slug: slug.value, body: body.value, draftId: draftId
      }));
    } catch (_) {
      // Private browsing or a full storage quota should not prevent publishing.
    }
  }

  function clearDraft() {
    try { localStorage.removeItem(draftKey); } catch (_) { /* Storage may be unavailable. */ }
  }

  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (!draft) return;
      title.value = draft.title || '';
      subtitle.value = draft.subtitle || '';
      newTopic.value = draft.newTopic || '';
      slug.value = draft.slug || '';
      body.value = draft.body || '';
      draftId = draft.draftId || draftId;
      if (draft.topic && Array.from(topic.options).some(option => option.value === draft.topic)) {
        topic.value = draft.topic;
      } else if (draft.topic || draft.newTopic) {
        topic.value = '__new__';
        newTopic.value = draft.newTopic || draft.topic;
      }
    } catch (_) {
      // Ignore a damaged old draft.
    }
  }

  function refresh() {
    newTopicRow.hidden = topic.value !== '__new__';
    newTopic.required = topic.value === '__new__';
    const now = new Date();
    pathPreview.textContent = filePath(now);
    filePreview.textContent = markdown(now);
    saveDraft();
  }

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || '';
  }

  function encodeContent(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }

  async function githubRequest(url, accessToken, options) {
    const response = await fetch(url, Object.assign({
      cache: 'no-store',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + accessToken,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, options || {}));
    let data = null;
    try { data = await response.json(); } catch (_) { /* Some errors have no JSON body. */ }
    return { response: response, data: data };
  }

  function apiError(result, fallback) {
    if (result.response.status === 401) return '令牌无效或已过期。请重新生成并粘贴 Fine-grained PAT。';
    if (result.response.status === 403) return '没有写入权限，或触发了 GitHub API 限制。请检查令牌的仓库范围与 Contents 读写权限。';
    return (result.data && result.data.message) || fallback;
  }

  async function publish(event) {
    event.preventDefault();
    const accessToken = token.value.trim();
    const selectedTopic = chosenTopic();
    const requestedSlug = slug.value.trim();

    if (!form.reportValidity()) return;
    if (!selectedTopic || /[\r\n]/.test(selectedTopic)) return setStatus('请选择已有主题或填写新主题。', 'error');
    if (requestedSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug)) return setStatus('链接名只能使用小写英文字母、数字和连字符。', 'error');
    if (!accessToken) return setStatus('请先粘贴 GitHub 令牌。', 'error');

    const now = new Date();
    const path = filePath(now);
    const content = markdown(now);
    const postSlug = chosenSlug();
    const postTitle = title.value.trim();
    const endpoint = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path;
    const controls = Array.from(form.querySelectorAll('input, select, textarea, button'));
    const wasDisabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    setStatus('正在核对 GitHub 身份与目标文件……');

    try {
      const user = await githubRequest('https://api.github.com/user', accessToken);
      if (!user.response.ok) throw new Error(apiError(user, '无法验证 GitHub 身份。'));
      if (!user.data || !user.data.login || user.data.login.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('当前令牌属于 ' + (user.data && user.data.login || '未知账号') + '，请使用 ' + owner + ' 的令牌。');
      }

      const existing = await githubRequest(endpoint + '?ref=' + branch, accessToken);
      if (existing.response.status === 200) throw new Error('目标文件已存在。请更换链接名后重试，原文章不会被覆盖。');
      if (existing.response.status !== 404) throw new Error(apiError(existing, '检查目标文件时失败。'));

      setStatus('正在提交文章……');
      const created = await githubRequest(endpoint, accessToken, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: 'Publish post: ' + postTitle,
          content: encodeContent(content),
          branch: branch
        })
      });
      if (created.response.status !== 201) throw new Error(apiError(created, '提交文章失败。'));

      if (topic.value === '__new__' && !Array.from(topic.options).some(option => option.value === selectedTopic)) {
        topic.add(new Option(selectedTopic, selectedTopic), topic.options[topic.options.length - 1]);
      }

      const articleUrl = location.origin + '/' + dateParts(now).day.replace(/-/g, '/') + '/' + postSlug + '/';
      status.replaceChildren(document.createTextNode('已提交。GitHub Pages 构建完成后可打开 '));
      const articleLink = document.createElement('a');
      articleLink.href = articleUrl;
      articleLink.textContent = '文章链接';
      status.appendChild(articleLink);
      status.appendChild(document.createTextNode('。'));
      status.dataset.state = 'success';
      token.value = '';
      clearDraft();
    } catch (error) {
      setStatus(error.message || '网络请求失败。请检查连接后重试。', 'error');
    } finally {
      controls.forEach((control, index) => { control.disabled = wasDisabled[index]; });
    }
  }

  form.addEventListener('input', refresh);
  topic.addEventListener('change', refresh);
  form.addEventListener('submit', publish);
  clearButton.addEventListener('click', function () {
    form.reset();
    token.value = '';
    draftId = makeDraftId();
    refresh();
    clearDraft();
    setStatus('草稿已清空。');
  });

  loadDraft();
  refresh();
})();
