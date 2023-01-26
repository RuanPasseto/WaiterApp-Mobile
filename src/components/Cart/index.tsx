import { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { CartItem } from '../../types/CartItem';
import { Product } from '../../types/Product';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button';
import { MinusCircle } from '../Icons/MinusCircle';
import { PlusCircle } from '../Icons/PlusCircle';
import { OrderConfimedModal } from '../OrderConfimedModal';
import { Text } from '../Text';

import { Item,
    ProductContainer,
    Actions,
    Image,
    QauntityContainer,
    ProductDetails,
    Summary,
    TotalContainer,
} from './styles';

interface CartProps {
    cartItems: CartItem[]
    onAdd: (product: Product) => void;
    onDecrement: (product: Product) => void;
    onCofirmOrder: () => void;
    selectedTable: string
}



export function Cart({ cartItems, onAdd, onDecrement, onCofirmOrder, selectedTable }: CartProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const total = cartItems.reduce((acc, cartItem) => {
        return acc + cartItem.quantity * cartItem.product.price;
    }, 0);

    async function handleConfirmOrder() {
        const payload = {
            table: selectedTable,
            products: cartItems.map((cartItem) => ({
                product: cartItem.product._id,
                quantity: cartItem.quantity,
            })),
        };

        setIsLoading(true);

        await api.post('/orders', payload);

        setIsLoading(false);
        setIsModalVisible(true);
    }

    function handleOk() {
        onCofirmOrder();
        setIsModalVisible(false);
    }

    return (
        <>
            <OrderConfimedModal
                visible={isModalVisible}
                onOk={handleOk}
            />

            {cartItems.length > 0 && (
                <FlatList
                    data={cartItems}
                    keyExtractor={cartItem => cartItem.product._id}
                    showsVerticalScrollIndicator={false}
                    style={{ marginBottom: 20, maxHeight: 150 }}
                    renderItem={({ item: cartItem }) =>(
                        <Item>
                            <ProductContainer>
                                <Image
                                    source={{
                                        uri:`http://192.168.15.15:3001/uploads/${cartItem.product.imagePath}`,
                                    }}
                                />
                                <QauntityContainer>
                                    <Text size={14} color="#666">
                                        {cartItem.quantity}X
                                    </Text>
                                </QauntityContainer>
                                <ProductDetails>
                                    <Text size={14} weight="600">
                                        {cartItem.product.name}
                                    </Text>
                                    <Text size={14} color="#666" style={{marginTop: 4}}>
                                        {formatCurrency(cartItem.product.price)}
                                    </Text>
                                </ProductDetails>
                            </ProductContainer>

                            <Actions>
                                <TouchableOpacity
                                    style={{marginRight: 24}}
                                    onPress={() => onAdd(cartItem.product)}
                                >
                                    <PlusCircle />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => onDecrement(cartItem.product)}>
                                    <MinusCircle />
                                </TouchableOpacity>
                            </Actions>
                        </Item>
                    )}
                />
            )}

            <Summary>
                <TotalContainer>
                    {cartItems.length > 0 ? (
                        <>
                            <Text color="#666">Total</Text>
                            <Text size={20} weight="600">{formatCurrency(total)}</Text>
                        </>
                    ):(
                        <Text color="#999">Seu carrinho esta vazio</Text>
                    )}
                </TotalContainer>

                <Button
                    onPress={handleConfirmOrder}
                    disabled={cartItems.length === 0}
                    loading={isLoading}
                >
                Confirmar pedido
                </Button>
            </Summary>
        </>
    );
}
