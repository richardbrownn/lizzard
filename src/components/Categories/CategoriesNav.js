import { Form } from 'react-bootstrap';
import './Categories.css'

function CategoriesNav({ handleSelectChange, searchParams }) {
    return (
        <div id="sider">
            <Form.Group controlId="paramSelect">
                <Form.Control as="select" onChange={handleSelectChange('globalCategory')}>
                    <option value="all">Глобальная категория</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('type')}>
                    <option value="all">Тип</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('city')}>
                    <option value="all">Город</option>
                    <option value="MOSCOW">МОСКВА</option>
                    <option value="SAINT-PETERSBURG">САНКТ-ПЕТЕРБУРГ</option>
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('district')}>
                    <option value="all">Район</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('quantity')}>
                    <option value="all">Количество</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('category')}>
                    <option value="all">Категория</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
                <Form.Control as="select" onChange={handleSelectChange('subcategory')}>
                    <option value="all">Подкатегория</option>
                    {/* Добавьте другие варианты здесь */}
                </Form.Control>
            </Form.Group>
        </div>
    )
}

export default CategoriesNav;
