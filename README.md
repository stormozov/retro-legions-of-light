
# 🎮 Retro legions of light — Пиксельная пошаговая игра против компьютера

[![CI](https://github.com/stormozov/retro-legions-of-light/actions/workflows/CI.yaml/badge.svg?event=push)](https://github.com/stormozov/retro-legions-of-light/actions/workflows/CI.yaml)

Это браузерная пиксельная 2D игра с пошаговыми боями. Игроку предстоит взять на себя командованием отряда из 2 персонажей. Цель игры — победа над отрядом компьютера и улучшение своей игровой статистики.

Презентация работы игры: [https://stormozov.github.io/retro-legions-of-light/](https://stormozov.github.io/retro-legions-of-light/)

## 🧩 Особенности

- Пиксельная графика с использованием иконок
- Пошаговые бои с элементами тактики
- Сохранение прогресса через localStorage
- Смена игрового поля по завершению уровня
- Нет ограничений на достигнутые уровни
- Статистика игры

## 🛠 Технологии

Какие технологии используются в проекте:

- HTML5
- SCSS
- Typescript (ES6+)
- NPM
- Webpack (^5.99.9)

## 📦 Установка и запуск

Клонируйте репозиторий

```bash
  git clone https://github.com/stormozov/retro-legions-of-light.git
```

Установите зависимости

```bash
  npm install
```

Запустите сервер разработки

```bash
  npm run start
```

| Страница откроется в браузере по умолчанию самостоятельно

## 🧪 Тестирование

Чтобы запустить тесты, выполните следующую команду

```bash
  npm run test
```

Для проверки покрытия кода, выполните следующую команду

```bash
  npm run coverage
```

Для запуска линтера используйте команду

```bash
  npm run lint
```

## 🕹 Игровые правила

1) В игре всего 6 персонажей. У каждой стороны по 3 персонажа.

Персонажи игрока:

- Мечник
- Лучник
- Маг

Персонажи компьютера:

- Нежить
- Вампир
- Демон

| Свойства персонажей, такие как здоровье, атака и защита, описаны в `character.json` файле

| Персонажи генерируются в команду рандомно. Однако не может быть двух магов в одной команде.

2) Поле для игры состоит из 8 на 8 клеток.

![Размеры игрового поля](https://camo.githubusercontent.com/67da27cd4d3abdf68b248bb65e695f7c2c188f3f1e7eea290f44ac87dc182f19/68747470733a2f2f692e706f7374696d672e63632f74676358313738522f5362527775414c322e706e67)

3) Игра не имеет ограничений по уровням. Можно продолжать играть, пока игрок не проиграет компьютеру, либо не начнет новую игру. После достижения шестого уровня повышается только номер уровня, а показатели защиты и атаки остаются неизменными.

4) Игра сохраняется и загружается в ручную с помощью соответствующих кнопок. Состояния игры хранятся в `LocalStorage`

5) Если игрок теряет одного из персонажей и переходит на новый уровень, то уровень начинается только с тем персонажем, который выжил на предыдущем уровне. Воскрешение персонажей не предусмотрено.

6) Управление игровыми персонажами осуществляется посредством мыши. Для активации передвижения или атаки необходимо произвести одиночный щелчок левой кнопкой мыши по соответствующей ячейке на игровом поле, где расположен персонаж. Визуальное выделение ячейки посредством желтого контура сигнализирует о том, что данный персонаж был успешно выбран. После этого пользователь получает возможность осуществлять его перемещение и выполнение атак в пределах заданного радиуса действия. При наведении курсора мыши на доступные для атаки клетки, они отображают визуальные индикаторы, информирующие о возможных действиях.

![Управление игровыми персонажами](https://camo.githubusercontent.com/55e0ffc592b42ac2ab0be97c08277e4503f445a585359d2e95a5162e12039282/68747470733a2f2f692e696d6775722e636f6d2f48556c6a3378372e706e67)

7) В рамках одного игрового хода игрок имеет возможность осуществить действия только за одного персонажа. Аналогично, компьютер может совершать действия только за одного из своих персонажей.

8) Алгоритм действий компьютера базируется на принципах оптимизации ресурсов. Компьютер осуществляет приоритетное перемещение и атаку на того персонажа игрока, который, по его оценкам, может быть нейтрализован с наименьшими затратами времени и ресурсов.

9) При активации курсора над ячейкой, содержащей информацию о персонаже игрока или компьютера, будет отображаться окно с детализированными характеристиками данного персонажа.

![характеристики персонажей при наведении](https://camo.githubusercontent.com/ebe0ba5711d1968a6cd88a366736fb5103c0a8305a24e135eb782f1f50808f56/68747470733a2f2f692e696d6775722e636f6d2f536c6a4a6a45302e706e67)

10) Перемещение и атака всеми персонажами могут осуществляться исключительно в вертикальной, горизонтальной плоскости или по диагонали.

![Перемещение персонажей](https://camo.githubusercontent.com/efe496d08b2d4284e50f61f70184470991dae25f2307d525a68b330b3e0d3f9b/68747470733a2f2f692e696d6775722e636f6d2f797038766a684c2e6a7067)

11) Игрок имеет доступ к своей игровой статистике. Для ее просмотра необходимо нажать на соответствующую кнопку интерфейса.

12) Персонажи генерируются случайным образом в столбцах 1 и 2 для игрока и в столбцах 7 и 8 для соперника. 

![Отрисовка команд персонажей](https://camo.githubusercontent.com/10c305a7c41e9e92d5775191c1a8c8d3c94d8fe8a028443d842b3efff14cada7/68747470733a2f2f692e696d6775722e636f6d2f587163563175572e6a7067)

## 📬 Связь

- GitHub профиль: [@stormozov](https://github.com/stormozov)
- Почта: [web@stormozov.ru](web@stormozov.ru)

