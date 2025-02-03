import styled from 'styled-components';

const StyledListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;

  .column {
    flex: 1;
    width: 300px;  /* Szerokość kolumny */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions {
    flex: 0.5;
    display: flex;
    gap: 10px;
  }
`;

export default StyledListItem;